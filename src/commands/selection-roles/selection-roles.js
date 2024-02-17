const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, ActionRowBuilder,
    RoleSelectMenuBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const { re, delr } = require("../../../utils/functions/functions.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('selection-roles')
        .setDescription('Manage the selection roles.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addSubcommand(subcommand => subcommand.setName('add').setDescription('Add selection role(s).')
            .addStringOption(option => option.setName('message').setDescription('The message to send with the selection menu.').setRequired(true))
            .addChannelOption(option => option.setName('channel').setDescription('The channel to send the message to.'))
            .addIntegerOption(option => option.setName('min').setDescription('The minimum number of roles that must be selected.').setMinValue(0).setMaxValue(25))
            .addIntegerOption(option => option.setName('max').setDescription('The maximum number of roles that can be selected.').setMinValue(0).setMaxValue(25))),
    execute: async (interaction) => {
        const channel = interaction.options.getChannel('channel') || interaction.channel;
        const message = interaction.options.getString('message');
        const min = interaction.options.getInteger('min') || 0;
        const max = interaction.options.getInteger('max') || 25;

        if (channel.type !== ChannelType.GuildText)
            return re(interaction, "The channel must be a text channel.").then(() => delr(interaction, 7500));

        if (min > max)
            return re(interaction, "The minimum number of roles must be less than or equal to the maximum number of roles.").then(() => delr(interaction, 7500));

        const roleSelect = new RoleSelectMenuBuilder()
            .setCustomId('roles')
            .setPlaceholder('Select role(s).')
            .setMinValues(1)
            .setMaxValues(25);

        const row = new ActionRowBuilder().addComponents(roleSelect);

        await interaction.reply({ content: 'Select the role(s) to be added to the select menu.', components: [row], ephemeral: true });

        const msg = await interaction.fetchReply();
        const filter = i => i.customId === 'roles' && i.user.id === interaction.user.id;
        const collector = msg.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async (i) => {
            if (i.customId !== 'roles') return;
            await i.deferUpdate().catch(err => err);

            if (i.values.length < min)
                return i.editReply({ content: `You must select at least ${min} role(s).`, components: [] }).then(() => delr(interaction, 7500));

            await interaction.editReply({ content: 'Roles have been selected.', components: [] }).then(() => delr(interaction, 7500));

            const roleSelect = new StringSelectMenuBuilder()
                .setCustomId('select-menu-roles')
                .setPlaceholder('Select role(s) to join/leave.')
                .setMinValues(min)
                .setMaxValues(i.values.length > max ? max : i.values.length)
                .addOptions(i.roles.map(i => new StringSelectMenuOptionBuilder().setLabel(i.name).setValue(i.id)));

            const rowSelect = new ActionRowBuilder().addComponents(roleSelect);

            try {
                await channel.send({ content: `${message}`, components: [rowSelect] });
            } catch (err) {
                return interaction.editReply({ content: `There was an error sending the select menu message: \n\`${err}\``, components: [] });
            }
        });

        collector.on('end', collected => {
            if (collected.size === 0) interaction.deleteReply();
        });
    },
};