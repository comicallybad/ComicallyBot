const { s, r, del, messagePrompt } = require("../../functions.js");
const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");

module.exports = {
    name: "mute",
    aliases: ["timeout"],
    category: "moderation",
    description: "Mute a member.",
    permissions: "moderator",
    usage: "<@user | userID> [reason]",
    run: async (client, message, args) => {
        if (!message.guild.me.permissions.has("MODERATE_MEMBERS"))
            return r(message.channel, message.author, "I don't have permission to timeout members!").then(m => del(m, 7500));

        const logChannel = message.guild.channels.cache.find(c => c.name.includes("mod-logs")) || message.channel;

        let mutee = message.mentions.members.first() || await message.guild.members.fetch(args[0]);
        if (!mutee) return r(message.channel, message.author, "Please provide a member to be timed out!").then(m => del(m, 7500));

        if (mutee.id === message.author.id)
            return r(message.channel, message.author, "You can't timeout yourself...").then(m => del(m, 7500));

        let reason = args.slice(1).join(" ");
        if (!reason) reason = "No reason given"

        const promptEmbed = new MessageEmbed()
            .setColor("GREEN")
            .setAuthor({ name: `This verification becomes invalid after 30s.` })
            .setDescription(`Do you want to timeout ${mutee}?`)

        const promptEmbedTimer = new MessageEmbed()
            .setColor("#0efefe")
            .setAuthor({ name: `This verification becomes invalid after 30s.` })
            .setDescription(`How long do you wish to timeout ${mutee}? (in minutes)`)

        await s(message.channel, '', promptEmbed).then(async msg => {
            const emoji = await messagePrompt(msg, message.author, 30, ["✅", "❌"]);

            if (emoji === "✅") {
                del(msg, 0);

                const embed = new MessageEmbed()
                    .setColor("#ff0000")
                    .setTitle("Member Timed Out")
                    .setThumbnail(mutee.user.displayAvatarURL())
                    .setFooter({ text: message.member.displayName, iconURL: message.author.displayAvatarURL() })
                    .setTimestamp()
                    .setDescription(stripIndents`
                    **Timeout Member:** ${mutee} (${mutee.id})
                    **Timed Out By:** ${message.member} (${message.author.id})
                    **Reason:** ${reason}`);

                return s(message.channel, '', promptEmbedTimer).then(async msg => {
                    const emojiTime = await messagePrompt(msg, message.author, 30, ["1️⃣", "5️⃣", "🔟"]);

                    if (emojiTime === "1️⃣") {
                        del(msg, 0);
                        mutee.timeout(60000, `${reason}`).then(() => {
                            mutee.send(`Hello, you have been **timed out** for **1 minute** in ${message.guild.name} for: **${reason}**`).catch(err => err); //in case DM's are closed
                            r(message.channel, message.author, `${mutee.user.username} was successfully timed out for **1 minute**.`).then(m => del(m, 7500));
                            embed.addField("Timeout Time: ", "**1 Minute**");

                            s(logChannel, '', embed);
                        }).catch(err => r(message.channel, message.author, `There was an error attempting to timeout ${mutee}: ${err}`).then(m => del(m, 7500)));
                    } else if (emojiTime === "5️⃣") {
                        del(msg, 0);
                        mutee.timeout(300000, `${reason}`).then(() => {
                            mutee.send(`Hello, you have been **timed out** for **5 minutes** in ${message.guild.name} for: **${reason}**`).catch(err => err); //in case DM's are closed
                            r(message.channel, message.author, `${mutee.user.username} was successfully timed out for **5 minutes**.`).then(m => del(m, 7500));
                            embed.addField("Timeout Time: ", "**5 Minutes**");

                            return s(logChannel, '', embed);
                        }).catch(err => r(message.channel, message.author, `There was an error attempting to timeout ${mutee}: ${err}`).then(m => del(m, 7500)));
                    } else if (emojiTime === "🔟") {
                        del(msg, 0);
                        mutee.timeout(600000, `${reason}`).then(() => {
                            mutee.send(`Hello, you have been **timed out** for **10 minutes** in ${message.guild.name} for: **${reason}**`).catch(err => err); //in case DM's are closed
                            r(message.channel, message.author, `${mutee.user.username} was successfully timed out for **10 minutes**.`).then(m => del(m, 7500));
                            embed.addField("Timeout Time: ", "**10 Minutes**");

                            return s(logChannel, '', embed);
                        }).catch(err => r(message.channel, message.author, `There was an error attempting to timeout ${mutee}: ${err}`).then(m => del(m, 7500)));
                    } else return del(msg, 0);
                }).catch(err => err);
            } else if (emoji === "❌") {
                del(msg, 0);
                return r(message.channel, message.author, `Timeout cancelled.`).then(m => del(m, 7500));
            } else return del(msg, 0);
        }).catch(err => err);
    }
}