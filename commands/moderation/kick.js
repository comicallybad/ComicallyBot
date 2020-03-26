const { del, promptMessage } = require("../../functions.js");
const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");

module.exports = {
    name: "kick",
    category: "moderation",
    description: "Kick a member.",
    permissions: "moderator",
    usage: "<mention | id>",
    run: async (client, message, args) => {
        const logChannel = message.guild.channels.cache.find(c => c.name === "mod-logs") || message.channel;

        if (!message.member.hasPermission("KICK_MEMBERS"))
            return message.reply("You do not have the ban members permission to use this command.").then(m => del(m, 7500));

        if (!message.guild.me.hasPermission("KICK_MEMBERS"))
            return message.reply("I don't have permission to kick members!").then(m => del(m, 7500));

        if (!args[0])
            return message.reply("Please provide a person to kick.").then(m => del(m, 7500));

        const toKick = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

        if (!toKick)
            return message.reply("Couldn't find that member, try again").then(m => del(m, 7500));

        if (toKick.id === message.author.id)
            return message.reply("You can't kick yourself...").then(m => del(m, 7500));

        if (!toKick.kickable)
            return message.reply("I can't kick that person due to role hierarchy, I suppose.").then(m => del(m, 7500));

        let reason = args.slice(1).join(" ")
        if (!reason) reason = "No reason given!"

        const embed = new MessageEmbed()
            .setColor("#ff0000")
            .setThumbnail(toKick.user.displayAvatarURL())
            .setFooter(message.member.displayName, message.author.displayAvatarURL())
            .setTimestamp()
            .setDescription(stripIndents`**> Kicked member:** ${toKick} (${toKick.id})
            **> Kicked by:** ${message.member} (${message.member.id})
            **> Reason:** ${reason}`);

        const promptEmbed = new MessageEmbed()
            .setColor("GREEN")
            .setAuthor(`This verification becomes invalid after 30s.`)
            .setDescription(`Do you want to kick ${toKick}?`)

        // Send the message
        await message.channel.send(promptEmbed).then(async msg => {
            // Await the reactions and the reaction collector
            const emoji = await promptMessage(msg, message.author, 30, ["✅", "❌"]);

            // The verification stuffs
            if (emoji === "✅") {
                del(msg, 0);

                toKick.send(`Hello, you have been **kicked** in ${message.guild.name} for: **${reason}**`).catch(err => console.log(err));
                toKick.kick(reason)
                    .catch(err => {
                        if (err) return message.channel.send(`Well.... the kick didn't work out. Here's the error ${err}`).then(m => del(m, 7500));
                    });

                logChannel.send(embed);
            } else if (emoji === "❌") {
                del(msg, 0);

                message.reply(`Kick cancelled.`).then(m => del(m, 7500));
            }
        });
    }
};