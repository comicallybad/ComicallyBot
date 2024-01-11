const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const { s, r, re, er, delr, messagePrompt } = require("../../../utils/functions/functions.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('Remove timeout from a member.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option => option.setName('user').setDescription('The user to unmute').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('The reason for unmuting the user')),
    async execute(interaction) {
        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ModerateMembers))
            return re(interaction, "I don't have permission to MUTE MEMBERS!").then(() => delr(interaction, 15000));

        const logChannel = interaction.guild.channels.cache.find(c => c.name.includes('action-logs'))
        const mutee = interaction.options.getMember('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        if (mutee.id === interaction.user.id || mutee.id === interaction.guild.members.me.id)
            return re(interaction, "I can't perform this action.").then(() => delr(interaction, 15000));

        const promptEmbed = new EmbedBuilder()
            .setColor('#00ff00')
            .setAuthor({ name: `This verification becomes invalid after 30s.`, iconURL: interaction.user.displayAvatarURL() })
            .setDescription(`Do you want to remove ${mutee}'s timeout?`);

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
                await mutee.timeout(null)
                const embed = new EmbedBuilder()
                    .setColor('#00ff00')
                    .setTitle('Member Timeout Removed')
                    .setThumbnail(mutee.user.displayAvatarURL())
                    .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                    .setTimestamp()
                    .addFields({
                        name: '__**Target**__',
                        value: `${mutee}`,
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
                return er(interaction, "Timeout removed.", [], []).then(() => delr(interaction, 15000));
            }
        } catch (err) {
            return er(interaction, `An error occured while trying to remove timeout: \n\`${err}\``, [], []).then(() => delr(interaction, 15000));
        }
    },
};