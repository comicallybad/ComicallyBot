const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const db = require("../../../utils/schemas/db.js");
const { s } = require("../../../utils/functions/functions.js");

module.exports = async (client, member) => {
    activities = [`${client.guilds.cache.size} servers!`, `${client.channels.cache.size} channels!`, `${client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)} users!`], i = 0;
    const memberLogsChannel = member.guild.channels.cache.find(c => c.name.includes("member-logs"));
    const modLogsChannel = member.guild.channels.cache.find(c => c.name.includes("mod-logs"));
    const logChannel = memberLogsChannel || modLogsChannel;

    if (!logChannel || member.user.id == client.user.id) return;

    const guildID = member.guild.id;
    const currentDate = new Date();
    const userJoinDate = member.user.createdAt;
    const time = currentDate - userJoinDate;
    const userJoinTimestamp = Math.floor(member.user.createdAt.getTime() / 1000);
    const ONE_MONTH_IN_MS = 2629746000;

    const embed = new EmbedBuilder()
        .setColor("#0efefe")
        .setTitle("Member Joined")
        .setThumbnail(member.user.displayAvatarURL())
        .setDescription(`${member.user} (${member.user.id})`)
        .setFooter({ text: `${member.user.tag}`, iconURL: member.user.displayAvatarURL() })
        .setTimestamp()
        .addFields({ name: `${time <= ONE_MONTH_IN_MS ? "**Warning**" : ""} Account Created:`, value: `<t:${userJoinTimestamp}:R>` });

    s(logChannel, '', embed);

    const exists = await db.findOne({ guildID: guildID }).catch(err => err);
    if (!exists || !exists.channels.find(ch => ch.command == "welcome") || !(exists.welcomeMessage.length > 0)) return;

    const welcomeCH = await member.guild.channels.fetch(exists.channels.find(ch => ch.command == "welcome").channelID).catch(err => { return; });
    if (!welcomeCH || !member.guild.members.me.permissionsIn(welcomeCH)?.has(PermissionFlagsBits.SendMessages)) return;

    let welcomeMSG = exists.welcomeMessage.toString().replace(/\[user\]/g, `${member.user}`);

    if (welcomeCH && welcomeMSG)
        s(welcomeCH, `${welcomeMSG}`).catch(err => s(logChannel, `There was an error in sending a welcome message: ${err}`));
};