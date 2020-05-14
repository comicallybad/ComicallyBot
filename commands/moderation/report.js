const { del } = require("../../functions.js");
const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");

module.exports = {
    name: "report",
    category: "moderation",
    description: "Reports a member.",
    permissions: "member",
    usage: "<mention | id>",
    run: (client, message, args) => {
        if (!args[0])
            return message.reply("Please provide a user").then(m => del(m, 7500));

        let rMember = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

        if (!rMember)
            return message.reply("Couldn't find that user").then(m => del(m, 7500));

        if (rMember.hasPermission("BAN_MEMBERS") || rMember.user.bot)
            return message.reply("Cannot report that user").then(m => del(m, 7500));

        if (!args[1])
            return message.channel.send("Please provide a reason for the report").then(m => del(m, 7500));

        let channel = message.guild.channels.cache.find(channel => channel.name === "reports") || message.guild.channels.cache.find(channel => channel.name === "mod-logs");

        if (!channel)
            return message.channel.send("Couldn't find a \`#reports\` or \`#mod-logs\` channel").then(m => del(m, 7500));

        const embed = new MessageEmbed()
            .setColor("RED")
            .setTitle("Report")
            .setTimestamp()
            .setFooter(message.guild.name, message.guild.iconURL)
            .setAuthor("Reported Member", rMember.user.displayAvatarURL())
            .setDescription(stripIndents`**Member: ${rMember} (${rMember.id})**
            **Reported by: ${message.member}**
            **Reported in: ${message.channel}**
            **Reason: ${args.slice(1).join(" ")}**`);

        return channel.send(embed);
    }
}  