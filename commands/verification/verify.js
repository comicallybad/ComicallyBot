const { s, r, del, messagePrompt } = require("../../functions.js");
const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");
const db = require('../../schemas/db.js');

let emojis = ["💖", "📛", "💘", "🔴", "❤️", "❤️‍🔥", "🍎", "💔", "🩸", "🟥"];

module.exports = {
    name: "verify",
    category: "verification",
    description: "Sends a verification message to prevent DM scamlink spammers.",
    permissions: "member",
    run: async (client, message, args) => {
        const logChannel = message.guild.channels.cache.find(c => c.name.includes("mod-logs")) || null;
        let guildID = message.guild.id;

        return db.findOne({ guildID: guildID, channels: { $elemMatch: { command: "verify" } } }, async (err, exists) => {
            if (!exists) return r(message.channel, message.author, "A verification channel has not been set by a moderator.").then(m => del(m, 7500));
            let channel = message.guild.channels.cache.get(exists.channels.filter(cmd => cmd.command == "verify")[0].channelID);

            if (message.channel.id !== channel.id)
                return r(message.channel, message.author, `This command is only available in the ${channel} channel.`).then(m => del(m, 7500));

            const embed = new MessageEmbed()
                .setColor("#0efefe")
                .setAuthor({ name: message.member.user.tag, iconURL: message.author.displayAvatarURL() })
                .setDescription(`**Please select the correct reaction below. The correction reaction will be: ♥️**`)
                .addFields({ name: 'Task:', value: '**Wait for all emojis to appear. Then, select the correct reaction below or you will have to wait 5 minutes to attempt again.**' })
                .setFooter({ text: 'This message expires in 30 seconds.' })
                .setTimestamp();

            emojis = emojis.sort(() => Math.random() - 0.5);

            const msg = await s(message.channel, '', embed);
            const emoji = await messagePrompt(msg, message.author, 30, emojis);
            if (emoji == "❤️") {
                del(msg, 0);
                r(message.channel, message.author, "Congratuations, you chose correctly!").then(m => del(m, 7500));

                const role = await message.guild.roles.cache.find(r => r.name === exists.verificationRole[0].roleName) || message.guild.roles.cache.find(r => r.id === exists.verificationRole[0].roleID);

                const embed = new MessageEmbed()
                    .setColor("#00FF00")
                    .setTitle("Member Verified")
                    .setThumbnail(message.member.user.displayAvatarURL())
                    .setFooter({ text: message.member.displayName, iconURL: message.author.displayAvatarURL() })
                    .setTimestamp()
                    .setDescription(stripIndents`
                    **Verified Member:** ${message.member} (${message.member.id})
                    **Role Added:** ${role.name} (${role.id})`);

                message.member.roles.add(role.id).then(() => {
                    s(message.channel, `${message.member} was successfully added to the **${role.name}** role.`).then(m => del(m, 7500));
                    if (logChannel)
                        return s(logChannel, '', embed);
                }).catch(err => r(message.channel, message.author, `There was an error attempting to add ${message.member} to the ${role.name} role: ${err}`).then(m => del(m, 7500)));
            } else {
                del(msg, 0);
                return r(message.channel, message.author, "Sorry, you chose incorrectly. 😢").then(m => del(m, 7500));
            }
        }).catch(err => err);
    }
}