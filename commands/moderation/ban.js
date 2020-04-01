const { del, promptMessage } = require("../../functions.js");
const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");

module.exports = {
    name: "ban",
    category: "moderation",
    description: "Ban a member.",
    permissions: "moderator",
    usage: "<id | mention> [reason]",
    run: async (client, message, args) => {
        const logChannel = message.guild.channels.cache.find(c => c.name === "mod-logs") || message.channel;

        if (!message.member.hasPermission("BAN_MEMBERS"))
            return message.reply("You do not have the ban members permission to use this command.").then(m => del(m, 7500));

        if (!message.guild.me.hasPermission("BAN_MEMBERS"))
            return message.reply("I don't have permission to ban members!").then(m => del(m, 7500));

        if (!args[0])
            return message.reply("Please provide a person to ban.").then(m => del(m, 7500));

        const toBan = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

        if (!toBan)
            return message.reply("Couldn't find that member, try again").then(m => del(m, 7500));

        if (toBan.id === message.author.id)
            return message.reply("You can't ban yourself...").then(m => del(m, 7500));

        if (!toBan.bannable)
            return message.reply("I can't ban that person due to role hierarchy, I suppose.").then(m => del(m, 7500));

        let reason = args.slice(1).join(" ")
        if (!reason) reason = "No reason given!"

        const embed = new MessageEmbed()
            .setColor("#ff0000")
            .setThumbnail(toBan.user.displayAvatarURL())
            .setFooter(message.member.displayName, message.author.displayAvatarURL())
            .setTimestamp()
            .setDescription(stripIndents`**> Banned member:** ${toBan} (${toBan.id})
            **> Banned by:** ${message.member}
            **> Reason:** ${reason}`);

        const promptEmbed = new MessageEmbed()
            .setColor("GREEN")
            .setAuthor(`This verification becomes invalid after 30s.`)
            .setDescription(`Do you want to ban ${toBan}?`)

        // Send the message
        await message.channel.send(promptEmbed).then(async msg => {
            // Await the reactions and the reactioncollector
            const emoji = await promptMessage(msg, message.author, 30, ["✅", "❌"]);

            // Verification stuff
            if (emoji === "✅") {
                del(msg, 0);

                //attempt ban and send message
                toBan.send(`Hello, you have been **banned** in ${message.guild.name} for: **${reason}**`).catch(err => console.log(err));
                toBan.ban(reason)
                    .catch(err => {
                        if (err) return message.reply(`Well.... the ban didn't work out. Here's the error ${err}`).then(m => del(m, 7500));
                    });

                logChannel.send(embed);
            } else if (emoji === "❌") {
                del(msg, 0);
                message.reply(`Ban cancelled.`).then(m => del(m, 7500));
            }
        });
    }
}