const { SlashCommandBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { r, re, er, delr } = require("../../../utils/functions/functions.js");
const { translate } = require('@vitalets/google-translate-api');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('translate')
        .setDescription('Translates a message for you.')
        .addSubcommand(subcommand => subcommand.setName('to').setDescription('Translates a message to a specified language.')
            .addStringOption(option => option.setName('language').setDescription('Language code').setRequired(true)))
        .addSubcommand(subcommand => subcommand.setName('default').setDescription('Translates a message to English.')),
    execute: async (interaction) => {
        const subcommand = interaction.options.getSubcommand(false);
        const language = interaction.options.getString('language') || undefined;

        if (subcommand === 'to' && !language)
            return re(interaction, "You must provide a language code to translate to.").then(() => delr(interaction, 7500));

        const modal = new ModalBuilder()
            .setCustomId(`translate-${interaction.id}`)
            .setTitle("Message To Translate")

        const textInput = new TextInputBuilder()
            .setCustomId("translate-input")
            .setLabel("Message To Translate")
            .setPlaceholder("Enter the message to translate here.")
            .setMaxLength(1024)
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

        const message = submitted.fields.getTextInputValue("translate-input")

        if (subcommand === 'to') {
            return translate(message, { to: language }).then(res => {
                return r(submitted, `**Translation:** ${res.text} **Translated from:** \`${res.raw.src}\``);
            }).catch(err => submitted.followUp(submitted, `There was an error translating: ${err}`));
        } else {
            return translate(message, { to: 'en' }).then(res => {
                return r(submitted, `**Translation:** ${res.text} **Translated from:** \`${res.raw.src}\``);
            }).catch(err => submitted.followUp(submitted, `There was an error translating: ${err}`));
        }
    }
}