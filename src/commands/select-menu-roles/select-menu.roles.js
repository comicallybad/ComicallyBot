const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, ActionRowBuilder, RoleSelectMenuBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const { re, delr } = require("../../../utils/functions/functions.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('selection-roles')
        .setDescription('Manage the selection roles.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addSubcommand(subcommand =>
            subcommand.setName('add').setDescription('Add selection role(s).')
                .addChannelOption(option => option.setName('channel').setDescription('The channel to send the message to.').setRequired(true))
                .addStringOption(option => option.setName('message').setDescription('The message to send.').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('remove').setDescription('Remove selection role(s).')
                .addChannelOption(option => option.setName('channel').setDescription('The channel to send the message to.').setRequired(true))
                .addStringOption(option => option.setName('message').setDescription('The message to send.').setRequired(true))),
    execute: async (interaction) => {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'add') return addSelectionRole(interaction);
        else if (subcommand === 'remove') return removeSelectionRole(interaction);
    },
};

async function addSelectionRole(interaction) {
    const channel = interaction.options.getChannel('channel');
    const message = interaction.options.getString('message');

    if (channel.type !== ChannelType.GuildText) return re(interaction, "The channel must be a text channel.").then(() => delr(interaction, 7500));

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
        if (i.customId === 'roles') {
            await i.deferUpdate().catch(err => err);
            await interaction.editReply({ content: 'Roles have been selected.', components: [] }).then(() => delr(interaction, 7500));

            const roleSelect = new StringSelectMenuBuilder()
                .setCustomId('select-menu-roles')
                .setPlaceholder('Select role(s) to join/leave.')
                .setMinValues(0)
                .setMaxValues(i.values.length)
                .addOptions(i.roles.map(i => new StringSelectMenuOptionBuilder().setLabel(i.name).setValue(i.id)));

            const rowSelect = new ActionRowBuilder().addComponents(roleSelect);

            try {
                await channel.send({ content: `${message}`, components: [rowSelect] });
            } catch (err) {
                return interaction.editReply({ content: `There was an error sending the select menu message: \n\`${err}\``, components: [] });
            }
        }
    });

    collector.on('end', collected => {
        if (collected.size === 0) interaction.deleteReply();
    });
}

async function removeSelectionRole(interaction) {
    // Your code here
}