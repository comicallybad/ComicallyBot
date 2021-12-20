const { s } = require('../../functions.js');
const { MessageEmbed } = require("discord.js");
const xp = require("../../schemas/xp.js");
const { stripIndents } = require("common-tags");

module.exports = async (client, member) => {
    let logChannel = await member.guild.channels.cache.find(c => c.name.includes("mod-logs")) || undefined;

    activities = [`${client.guilds.cache.size} servers!`, `${client.channels.cache.size} channels!`, `${client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)} users!`], i = 0;

    const fetchedLogs = await member.guild.fetchAuditLogs({
        limit: 1,
        type: 'MEMBER_KICK',
    });

    const kickLog = fetchedLogs.entries.first()

    if (!kickLog) {
        const embed = new MessageEmbed()
            .setColor("#FF0000")
            .setTitle("Member Left")
            .setThumbnail(member.user.displayAvatarURL())
            .setFooter(`ID: ${member.user.id}`)
            .setTimestamp()
            .setDescription(stripIndents`
            **User Left By:** Most likely leaving on their own will.
            **User Left:** ${member} (${member.id}`);

        return s(logChannel, '', embed).catch(err => err);
    }

    const { executor, target } = kickLog;

    if (target.id === member.id) {
        if (logChannel) {
            const embed = new MessageEmbed()
                .setColor("#FF0000")
                .setTitle("Member Kicked")
                .setThumbnail(member.user.displayAvatarURL())
                .setFooter(`ID: ${member.user.id}`)
                .setTimestamp()
                .setDescription(stripIndents`
                **User Kicked By:** ${executor} (${executor.id}).
                **User Kicked:** ${member.user} (${member.user.id}
                **Reason:** ${kickLog.reason}`);

            return s(logChannel, '', embed).catch(err => err);
        }
    } else {
        if (logChannel) {
            const embed = new MessageEmbed()
                .setColor("#FF0000")
                .setTitle("Member Left")
                .setThumbnail(member.user.displayAvatarURL())
                .setFooter(`ID: ${member.user.id}`)
                .setTimestamp()
                .setDescription(`${member} (${member.id})`);

            return s(logChannel, '', embed).catch(err => err);
        }
    }

    xp.deleteOne({ guildID: member.guild.id, userID: member.user.id }, {
    }).catch(err => console.log(err))
}