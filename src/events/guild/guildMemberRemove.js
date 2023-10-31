const { s } = require("../../../utils/functions/functions.js");;
const { EmbedBuilder } = require("discord.js");
const xp = require("../../../utils/schemas/xp.js");
const { stripIndents } = require("common-tags");

module.exports = async (client, member) => {
    let logChannel = member.guild.channels.cache.find(c => c.name.includes("member-logs"))
        || member.guild.channels.cache.find(c => c.name.includes("mod-logs")) || undefined;
    let actionChannel = member.guild.channels.cache.find(c => c.name.includes("action-logs"));

    activities = [`${client.guilds.cache.size} servers!`, `${client.channels.cache.size} channels!`, `${client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)} users!`], i = 0;

    xp.deleteOne({ guildID: member.guild.id, userID: member.user.id }).catch(err => err);

    try {
        const fetchedLogs = await member.guild.fetchAuditLogs({
            limit: 1,
            type: 'MEMBER_KICK',
        });

        let kickLog = fetchedLogs.entries.first();

        if (!kickLog) {
            if (logChannel) {
                const embed = new EmbedBuilder()
                    .setColor("#0EFEFE")
                    .setTitle("Member Left")
                    .setThumbnail(member.user.displayAvatarURL())
                    .setFooter({ text: `${member.user.tag}`, iconURL: member.user.displayAvatarURL() })
                    .setTimestamp()
                    .setDescription(`**User Left:** ${member} (${member.id})`);

                return s(logChannel, '', embed);
            }
        }

        const { executor, target } = kickLog;

        if (target.id === member.id) {
            if (actionChannel) {
                const embed = new EmbedBuilder()
                    .setColor("#FF0000")
                    .setTitle("Member Kicked")
                    .setThumbnail(member.user.displayAvatarURL())
                    .setFooter({ text: `${member.user.tag}`, iconURL: member.user.displayAvatarURL() })
                    .setTimestamp()
                    .setDescription(stripIndents`
                    **User Kicked:** ${member.user} (${member.user.id})
                    **User Kicked By:** ${executor} (${executor.id}).
                    **Reason:** ${kickLog.reason ? kickLog.reason : "No reason given!"}`);

                return s(actionChannel, '', embed);
            }
        } else {
            if (logChannel) {
                const embed = new EmbedBuilder()
                    .setColor("#0EFEFE")
                    .setTitle("Member Left")
                    .setThumbnail(member.user.displayAvatarURL())
                    .setFooter({ text: `${member.user.tag}`, iconURL: member.user.displayAvatarURL() })
                    .setTimestamp()
                    .setDescription(`${member} (${member.id})`);

                return s(logChannel, '', embed);
            }
        }
    } catch (err) {
        return;
    }
}