const { s } = require('../../functions.js');
const { MessageEmbed, CommandInteractionOptionResolver } = require("discord.js");
const xp = require("../../schemas/xp.js");
const { stripIndents } = require("common-tags");

module.exports = async (client, member) => {
    let logChannel = await member.guild.channels.cache.find(c => c.name.includes("mod-logs")) || undefined;

    activities = [`${client.guilds.cache.size} servers!`, `${client.channels.cache.size} channels!`, `${client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)} users!`], i = 0;

    xp.deleteOne({ guildID: member.guild.id, userID: member.user.id }, {
    }).catch(err => console.log(err))

    try {
        const fetchedLogs = await member.guild.fetchAuditLogs({
            limit: 1,
            type: 'MEMBER_KICK',
        });

        let kickLog = fetchedLogs.entries.first();

        if (!kickLog) {
            const embed = new MessageEmbed()
                .setColor("#0EFEFE")
                .setTitle("Member Left")
                .setThumbnail(member.user.displayAvatarURL())
                .setFooter(`${member.displayName}`, `${member.user.displayAvatarURL()}`)
                .setTimestamp()
                .setDescription(`**User Left:** ${member} (${member.id}`);

            return s(logChannel, '', embed);
        }

        const { executor, target } = kickLog;

        if (target.id === member.id) {
            if (logChannel) {
                const embed = new MessageEmbed()
                    .setColor("#FF0000")
                    .setTitle("Member Kicked")
                    .setThumbnail(member.user.displayAvatarURL())
                    .setFooter(`${member.displayName}`, `${member.user.displayAvatarURL()}`)
                    .setTimestamp()
                    .setDescription(stripIndents`
                    **User Kicked By:** ${executor} (${executor.id}).
                    **User Kicked:** ${member.user} (${member.user.id}
                    **Reason:** ${kickLog.reason ? kickLog.reason : "No reason given!"}`);

                return s(logChannel, '', embed);
            }
        } else {
            if (logChannel) {
                const embed = new MessageEmbed()
                    .setColor("#0EFEFE")
                    .setTitle("Member Left")
                    .setThumbnail(member.user.displayAvatarURL())
                    .setFooter(`${member.displayName}`, `${member.user.displayAvatarURL()}`)
                    .setTimestamp()
                    .setDescription(`**User Left:** ${member} (${member.id}`);

                return s(logChannel, '', embed);
            }
        }
    } catch (err) {
        return;
    }
}