const { s } = require('../../functions.js');
const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");

module.exports = async (client, ban) => {
    if (!ban.guild.me.permissions.has("VIEW_AUDIT_LOG"))
        return;

    let logChannel = await ban.guild.channels.cache.find(c => c.name.includes("action-logs"))
        || ban.guild.channels.cache.find(c => c.name.includes("mod-logs")) || undefined;

    try {
        const fetchedLogs = await ban.guild.fetchAuditLogs({
            limit: 1,
            type: 'MemberBanRemove',
        });

        const banLog = fetchedLogs.entries.first();

        if (!banLog) {
            const embed = new MessageEmbed()
                .setColor("#00FF00")
                .setTitle("Member Unbanned")
                .setThumbnail(ban.user.displayAvatarURL())
                .setFooter({ text: ban.user.tag, iconURL: ban.user.displayAvatarURL() })
                .setTimestamp()
                .setDescription(stripIndents`
                **Member Unbanned:** ${ban.userName} (${ban.user.id})
                **Unbanned By:** No audit log could be found. Unknown Member.`);

            return s(logChannel, '', embed);
        }

        const { executor } = banLog;

        if (!logChannel) return;
        const embed = new MessageEmbed()
            .setColor("#00FF00")
            .setTitle("Member Unbanned")
            .setThumbnail(ban.user.displayAvatarURL())
            .setFooter({ text: ban.user.tag, iconURL: ban.user.displayAvatarURL() })
            .setTimestamp()
            .setDescription(stripIndents`
            **Member Unbanned:** ${ban.user} (${ban.user.id})
            **Unbanned By:** ${executor} (${executor.id})
            **Reason:** ${banLog.reason ? banLog.reason : "No reason given!"}`);

        return s(logChannel, '', embed);
    } catch (err) {
        console.log(err);
    }
}