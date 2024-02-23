const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { s, r, re, delr } = require("../../../utils/functions/functions.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warns a member.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option => option.setName('member').setDescription('The member to warn').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('The reason for the warning').setMaxLength(1024).setRequired(true))
        .addChannelOption(option => option.setName('channel').setDescription('The channel the warning was issued in')),
    execute: async (interaction) => {
        const wMember = interaction.options.getMember('member');
        const reason = interaction.options.getString('reason');
        const channel = interaction.options.getChannel('channel');

        if (wMember.permissions.has(PermissionFlagsBits.BanMembers) || wMember.user.bot)
            return r(interaction, "Cannot warn that member.").then(() => delr(interaction, 7500));

        const logChannel = interaction.guild.channels.cache.find(c => c.name.includes("action-logs"))
            || interaction.guild.channels.cache.find(c => c.name.includes("mod-logs")) || undefined;

        if (!logChannel)
            return r(interaction, "Couldn't find a `#action-logs` or `#mod-logs` channel").then(() => delr(interaction, 7500));

        const embed = new EmbedBuilder()
            .setColor("#FF0000")
            .setTitle("Member Warned")
            .setThumbnail(wMember.user.displayAvatarURL())
            .setFooter({ text: wMember.user.tag, iconURL: wMember.user.displayAvatarURL() })
            .setTimestamp()
            .addFields({
                name: '__**Target**__',
                value: `${wMember}`,
                inline: true
            }, {
                name: '__**Reason**__',
                value: `${reason}`,
                inline: true
            }, {
                name: '__**Moderator**__',
                value: `${interaction.user}`,
                inline: true
            });

        const warnEmbed = new EmbedBuilder()
            .setColor("FF0000")
            .setTitle("You have been warned!")
            .setThumbnail(wMember.user.displayAvatarURL())
            .setFooter({ text: wMember.user.tag, iconURL: wMember.user.displayAvatarURL() })
            .setTimestamp()
            .addFields({
                name: '__**Member**__',
                value: `${wMember}`,
                inline: true
            }, {
                name: '__**Reason**__',
                value: `${reason}`,
                inline: true
            });

        s(channel ? channel : interaction.channel, '', warnEmbed);
        s(logChannel, '', embed);
        return re(interaction, "Warning has been issued.").then(() => delr(interaction, 7500));
    },
};