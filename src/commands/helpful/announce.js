const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { s, re, delr } = require("../../../utils/functions/functions.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("announce")
        .setDescription("Make an announcement to a channel.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addChannelOption(option => option.setName("channel").setDescription("The channel to send the announcement to.")),
    execute: async (interaction) => {
        const channel = interaction.options.getChannel("channel") || interaction.channel;

        const modal = new ModalBuilder()
            .setCustomId(`announcement-${interaction.id}`)
            .setTitle("Announcement Message")

        const textInput = new TextInputBuilder()
            .setCustomId("announcement-input")
            .setLabel("Announcement Message")
            .setPlaceholder("Enter the announcement message here.")
            .setMaxLength(2000)
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)

        const actionRow = new ActionRowBuilder().addComponents(textInput);
        modal.addComponents(actionRow);

        await interaction.showModal(modal)

        const submitted = await interaction.awaitModalSubmit({
            time: 30000,
            filter: i => i.user.id === interaction.user.id && i.customId.includes(interaction.id)
        }).catch(err => err);

        if (!submitted.fields) return;

        const announcement = submitted.fields.getTextInputValue("announcement-input")
        await re(submitted, "Announcement sent.").then(() => delr(submitted, 30000));
        return s(channel, `${announcement}`);
    }
}