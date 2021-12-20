const { s } = require('../../functions.js');
const { MessageEmbed } = require("discord.js");

module.exports = async (client, ban) => {
    let logChannel = await guild.channels.cache.find(c => c.name.includes("mod-logs")) || undefined;

    const fetchedLogs = await ban.guild.fetchAuditLogs({
        limit: 1,
        type: 'MEMBER_BAN_ADD',
    });

    const banLog = fetchedLogs.entries.first();

    if (!banLog) {
        const embed = new MessageEmbed()
            .setColor("#0efefe")
            .setTitle("Member Banned")
            .setThumbnail(ban.user.displayAvatarURL())
            .setFooter(`ID: ${ban.user.id}`)
            .setTimestamp()
            .setDescription(stripIndents`
            **User Banned By:** No audit log could be found. Unknown User.
            **User Banned:** ${ban} (${ban.user.id}`);

        return s(logChannel, '', embed).catch(err => err);
    }

    const { executor, target } = banLog;

    if (target.id === ban, user, id) {
        if (logChannel) {
            const embed = new MessageEmbed()
                .setColor("#0efefe")
                .setTitle("Member Banned")
                .setThumbnail(user.displayAvatarURL())
                .addField(`User Banned:`, `${ban.user} ${ban, user.id}`)
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
                .setColor("#0efefe")
                .setTitle("Member Banned")
                .setThumbnail(member.user.displayAvatarURL())
                .setFooter(`ID: ${member.user.id}`)
                .setTimestamp()
                .setDescription(`${member} (${member.id})`);

            return s(logChannel, '', embed).catch(err => err);
        }
    }
}
