const { s } = require('../../functions.js');
const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");

module.exports = async (client, ban) => {
    let logChannel = await ban.guild.channels.cache.find(c => c.name.includes("mod-logs")) || undefined;

    const fetchedLogs = await ban.guild.fetchAuditLogs({
        limit: 1,
        type: 'MEMBER_BAN_ADD',
    });

    const banLog = fetchedLogs.entries.first();
    console.log(logChannel);
    if (!banLog) {
        const embed = new MessageEmbed()
            .setColor("#FF0000")
            .setTitle("Member Banned")
            .setThumbnail(ban.user.displayAvatarURL())
            .setFooter(`ID: ${ban.user.id}`)
            .setTimestamp()
            .setDescription(stripIndents`
            **User Banned By:** No audit log could be found. Unknown User.
            **User Banned:** ${ban.user} (${ban.user.id}`);

        return s(logChannel, '', embed).catch(err => err);
    }

    const { executor, target } = banLog;

    if (target.id === ban.user.id) {
        if (logChannel) {
            const embed = new MessageEmbed()
                .setColor("#FF0000")
                .setTitle("Member Banned")
                .setThumbnail(ban.user.displayAvatarURL())
                .setFooter(`ID: ${ban.user.id}`)
                .setTimestamp()
                .setDescription(stripIndents`
                **User Banned By:** ${executor} (${executor.id})
                **User Banned:** ${ban.user} (${ban.user.id}`);

            return s(logChannel, '', embed).catch(err => err);
        }
    } else {
        if (logChannel) {
            const embed = new MessageEmbed()
                .setColor("#FF0000")
                .setTitle("Member Banned")
                .setThumbnail(ban.user.displayAvatarURL())
                .setFooter(`ID: ${ban.user.id}`)
                .setTimestamp()
                .setDescription(`${ban, user} (${ban.id})`);

            return s(logChannel, '', embed).catch(err => err);
        }
    }
}
