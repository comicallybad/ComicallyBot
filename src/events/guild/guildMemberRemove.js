const { s } = require("../../../utils/functions/functions.js");
const { EmbedBuilder } = require("discord.js");
const humanizeDuration = require('humanize-duration');

module.exports = async (client, member) => {
    const memberLogsChannel = member.guild.channels.cache.find(c => c.name.includes("member-logs"));
    const modLogsChannel = member.guild.channels.cache.find(c => c.name.includes("mod-logs"));
    const logChannel = memberLogsChannel || modLogsChannel;

    if (!logChannel || member.user.id == client.user.id) return;

    const currentDate = new Date();
    const timeInServer = currentDate - member.joinedAt;
    const durationInServer = humanizeDuration(timeInServer);

    const embed = new EmbedBuilder()
        .setColor("#0EFEFE")
        .setTitle("Member Left")
        .setThumbnail(member.user.displayAvatarURL())
        .setFooter({ text: `${member.user.tag}`, iconURL: member.user.displayAvatarURL() })
        .setTimestamp()
        .setDescription(`${member} (${member.id})`)
        .addFields({ name: 'Time in server:', value: `\`${durationInServer}\`` });

    return s(logChannel, '', embed);
};