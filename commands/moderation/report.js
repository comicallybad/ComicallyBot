const { s, r, del } = require("../../functions.js");
const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");

module.exports = {
    name: "report",
    category: "moderation",
    description: "Reports a member.",
    permissions: "member",
    usage: "<@user | userID>",
    run: (client, message, args) => {
        if (!args[0])
            return r(message.channel, message.author, "Please provide a user").then(m => del(m, 7500));

        let rMember = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

        if (!rMember)
            return r(message.channel, message.author, "Couldn't find that user").then(m => del(m, 7500));

        if (rMember.permissions.has("BAN_MEMBERS") || rMember.user.bot)
            return r(message.channel, message.author, "Cannot report that user").then(m => del(m, 7500));

        if (!args[1])
            return r(message.channel, message.author, "Please provide a reason for the report").then(m => del(m, 7500));

        let logChannel = message.guild.channels.cache.find(c => c.name.includes("reports"));
        if (!logChannel) message.guild.channels.cache.find(c => c.name.includes("mod-logs")) || undefined;

        if (!logChannel)
            return r(message.channel, message.author, "Couldn't find a \`#reports\` or \`#mod-logs\` channel").then(m => del(m, 7500));

        const embed = new MessageEmbed()
            .setColor("RED")
            .setTitle("Report")
            .setTimestamp()
            .setFooter(message.guild.name, message.guild.iconURL)
            .setAuthor("Reported Member", rMember.user.displayAvatarURL())
            .setDescription(stripIndents`**Member: ${rMember} (${rMember.id})**
            **Reported by:** ${message.member}
            **Reported in:** ${message.channel}
            **Reason:** ${args.slice(1).join(" ")}`);

        return s(logChannel, '', embed);
    }
}