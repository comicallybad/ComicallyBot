const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const { s, r, re, er, delr, messagePrompt } = require("../../../utils/functions/functions.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Unban a member.')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addUserOption(option => option.setName('user').setDescription('The user to unban').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('The reason for unbanning the user').setMaxLength(1024)),
    execute: async (interaction) => {
        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers))
            return re(interaction, "I don't have permission to `BAN MEMBERS`!").then(() => delr(interaction, 15000));

        const logChannel = interaction.guild.channels.cache.find(c => c.name.includes('action-logs'))
        const bannedMember = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        if (bannedMember.id === interaction.user.id || bannedMember.id === interaction.guild.members.me.id)
            return re(interaction, "I can't perform this action.").then(() => delr(interaction, 15000));

        const promptEmbed = new EmbedBuilder()
            .setColor('#00ff00')
            .setAuthor({ name: `This verification becomes invalid after 30s.`, iconURL: interaction.user.displayAvatarURL() })
            .setDescription(`Do you want to unban ${bannedMember}?`);

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder().setCustomId('✅').setLabel('Confirm').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('❌').setLabel('Cancel').setStyle(ButtonStyle.Danger)
            );

        await r(interaction, "", promptEmbed)

        const collectedInteraction = await messagePrompt(interaction, row, 30000);

        if (collectedInteraction.customId === '❌')
            return er(interaction, "Selection cancelled.", [], []).then(() => delr(interaction, 15000))

        try {
            if (collectedInteraction.customId === '✅') {
                await interaction.guild.members.unban(bannedMember, reason)
                const embed = new EmbedBuilder()
                    .setColor('#00ff00')
                    .setTitle('Member Unbanned')
                    .setThumbnail(bannedMember.displayAvatarURL())
                    .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                    .setTimestamp()
                    .addFields({
                        name: '__**Target**__',
                        value: `${bannedMember}`,
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

                if (logChannel) s(logChannel, "", embed);
                return er(interaction, "Member unbanned.", undefined, undefined).then(() => delr(interaction, 15000));
            }
        } catch (err) {
            return er(interaction, `An error occured while trying to unban: \n\`${err}\``, [], []).then(() => delr(interaction, 15000));
        }
    },
};