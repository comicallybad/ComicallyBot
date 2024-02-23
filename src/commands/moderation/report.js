const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { s, r, re, delr } = require("../../../utils/functions/functions.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('report')
        .setDescription('Reports a member.')
        .addUserOption(option => option.setName('member').setDescription('The member to report').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('The reason for the report').setMaxLength(1024).setRequired(true)),
    execute: (interaction) => {
        const rMember = interaction.options.getMember('member');
        const reason = interaction.options.getString('reason');

        if (rMember.permissions.has(PermissionFlagsBits.BanMembers) || rMember.user.bot)
            return r(interaction, "Cannot report that member.").then(() => delr(interaction, 7500));

        const logChannel = interaction.guild.channels.cache.find(c => c.name.includes("reports"))
            || interaction.guild.channels.cache.find(c => c.name.includes("mod-logs")) || undefined;

        if (!logChannel)
            return r(interaction, "Couldn't find a `#reports` or `#mod-logs` channel").then(() => delr(interaction, 7500));

        const embed = new EmbedBuilder()
            .setColor("#FF0000")
            .setTitle("Member Reported")
            .setThumbnail(rMember.user.displayAvatarURL())
            .setFooter({ text: rMember.user.tag, iconURL: rMember.user.displayAvatarURL() })
            .setTimestamp()
            .addFields({
                name: '__**Target**__',
                value: `${rMember}`,
                inline: true
            }, {
                name: '__**Reason**__',
                value: `${reason}`,
                inline: true

            }, {
                name: '__**Reporter**__',
                value: `${interaction.user}`,
                inline: true
            });

        s(logChannel, '', embed);
        return re(interaction, "Report has been filed.").then(() => delr(interaction, 7500));
    },
};