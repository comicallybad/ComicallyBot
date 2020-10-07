const { del, promptMessage } = require("../../functions.js");
const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");

module.exports = {
    name: "ban",
    category: "moderation",
    description: "Ban a member.",
    permissions: "moderator",
    usage: "<@user | userID> [reason]",
    run: async (client, message, args) => {
        const logChannel = message.guild.channels.cache.find(c => c.name === "mod-logs") || message.channel;

        if (!message.guild.me.hasPermission("BAN_MEMBERS"))
            return message.reply("I don't have permission to ban members!").then(m => del(m, 7500));

        try {
            let toBan = (message.mentions.users.first() || await client.users.fetch(args[0]));
            if (!toBan) return message.reply("Please supply a user to be banned!").then(m => del(m, 7500));


            if (toBan.id === message.author.id)
                return message.reply("You can't ban yourself...").then(m => del(m, 7500));

            let reason = args.slice(1).join(" ")
            if (!reason) reason = "No reason given!"

            const embed = new MessageEmbed()
                .setColor("#ff0000")
                .setTitle("User Banned")
                .setThumbnail(toBan.displayAvatarURL())
                .setFooter(message.member.displayName, message.author.displayAvatarURL())
                .setTimestamp()
                .setDescription(stripIndents`
            **Banned member:** ${toBan} (${toBan.id})
            **Banned by:** ${message.member}
            **Reason:** ${reason}`);

            const promptEmbed = new MessageEmbed()
                .setColor("GREEN")
                .setAuthor(`This verification becomes invalid after 30s.`)
                .setDescription(`Do you want to ban ${toBan}?`)

            await message.channel.send(promptEmbed).then(async msg => {
                const emoji = await promptMessage(msg, message.author, 30, ["✅", "❌"]);

                if (emoji === "✅") {
                    del(msg, 0);

                    message.guild.members.ban(toBan.id, reason).then(() => {
                        toBan.send(`Hello, you have been **banned** in ${message.guild.name} for: **${reason}**`).catch(err => err); //in case DM's are closed
                        message.reply(`${toBan.username} (${toBan.id}) was successfully banned.`).then(m => del(m, 7500));
                    }).catch(err => {
                        if (err) return message.reply(`There was an error attempting to ban ${toBan} ${err}`).then(m => del(m, 7500));
                    });

                    logChannel.send(embed);
                } else if (emoji === "❌") {
                    del(msg, 0);
                    return message.reply(`Ban cancelled.`).then(m => del(m, 7500));
                } else {
                    return del(msg, 0)
                }
            }).catch(err => err);
        } catch {
            return message.reply("There was an error finding the person.").then(m => del(m, 7500));
        }
    }
}