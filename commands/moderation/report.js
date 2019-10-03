const { RichEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");
const { getCommandStatus } = require("../../functions.js")

module.exports = {
    name: "report",
    aliases: ["moderation"],
    category: "moderation",
    description: "Reports a member",
    usage: "<mention | id>",
    run: (client, message, args) => {
        getCommandStatus(message, "report").then(async function (res) {
            if (res === false) message.reply("Command disabled").then(m => m.delete(5000))
            if (res === true) {
                if (message.deletable) message.delete();

                if (!args[0])
                    return message.reply("Please provide a user").then(m => m.delete(5000))

                let rMember = message.mentions.members.first() || message.guild.members.get(args[0])

                if (!rMember)
                    return message.reply("Couldn't find that user").then(m => m.delete(5000))

                if (rMember.hasPermission("BAN_MEMBERS") || rMember.user.bot)
                    return message.reply("Cannot report that user").then(m => m.delete(5000))

                if (!args[1])
                    return message.channel.send("Please provide a reason for the report").then(m => m.delete(5000))

                const channel = message.guild.channels.find(channel => channel.name === "reports");

                if (!channel)
                    return message.channel.send("Couldn't find a \`#reports\` channel").then(m => m.delete(5000))

                const embed = new RichEmbed()
                    .setColor("RED")
                    .setTimestamp()
                    .setFooter(message.guild.name, message.guild.iconURL)
                    .setAuthor("Reported Member", rMember.user.displayAvatarURL)
                    .setDescription(stripIndents`**> Member:** ${rMember} (${rMember.id})
        **>Reported by:** ${message.member} (${message.member.id})
        **>Reported in:** ${message.channel}
        **>Reason:** ${args.slice(1).join(" ")}`);

                return channel.send(embed)
            }
        })
    }
}  