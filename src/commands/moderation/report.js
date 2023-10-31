const { s, r, del } = require("../../../utils/functions/functions.js");
const { EmbedBuilder } = require("discord.js");
const { stripIndents } = require("common-tags");

module.exports = {
    name: "report",
    category: "moderation",
    description: "Reports a member.",
    permissions: "member",
    usage: "<@user | userID>",
    run: async (client, message, args) => {
        if (!args[0])
            return r(message.channel, message.author, "Please provide a member.").then(m => del(m, 7500));

        let rMember = message.mentions.members.first() || await message.guild.members.fetch(args[0]).catch(() => { return undefined });

        if (!rMember)
            return r(message.channel, message.author, "Couldn't find that member.").then(m => del(m, 7500));

        if (rMember.permissions.has("BAN_MEMBERS") || rMember.user.bot)
            return r(message.channel, message.author, "Cannot report that member.").then(m => del(m, 7500));

        if (!args[1])
            return r(message.channel, message.author, "Please provide a reason for the report").then(m => del(m, 7500));

        let logChannel = message.guild.channels.cache.find(c => c.name.includes("reports"))
            || message.guild.channels.cache.find(c => c.name.includes("mod-logs")) || undefined;

        if (!logChannel)
            return r(message.channel, message.author, "Couldn't find a \`#reports\` or \`#mod-logs\` channel").then(m => del(m, 7500));

        const embed = new EmbedBuilder()
            .setColor("RED")
            .setTitle("Report")
            .setTimestamp()
            .setFooter({ text: message.guild.name, iconURL: message.guild.iconURL })
            .setAuthor({ name: "Reported Member", iconURL: rMember.user.displayAvatarURL() })
            .setDescription(stripIndents`
            **Member:** ${rMember} (${rMember.id})
            **Reported By:** ${message.member}
            **Reported in:** ${message.channel}
            **Reason:** ${args.slice(1).join(" ")}`);

        return s(logChannel, '', embed);
    }
}