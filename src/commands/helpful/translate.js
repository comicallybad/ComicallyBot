const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { r } = require("../../../utils/functions/functions.js");
const { translate } = require('@vitalets/google-translate-api');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('translate')
        .setDescription('Translates a message for you.')
        .addSubcommand(subcommand => subcommand.setName('to').setDescription('Translates a message to a specified language.')
            .addStringOption(option => option.setName('language').setDescription('Language code').setRequired(true))
            .addStringOption(option => option.setName('message').setDescription('Message to translate').setRequired(true)))
        .addSubcommand(subcommand => subcommand.setName('default').setDescription('Translates a message to English.')
            .addStringOption(option => option.setName('message').setDescription('Message to translate').setRequired(true))),
    execute: (interaction) => {
        const subcommand = interaction.options.getSubcommand(false);
        const message = interaction.options.getString('message');
        const language = interaction.options.getString('language');

        if (subcommand === 'to') {
            if (!language)
                return r(interaction, "Please provide a language code Ex: 'en' for english 'es' for spanish.");

            return translate(message, { to: language }).then(res => {
                return r(interaction, `**Translation:** ${res.text} **Translated from:** \`${res.raw.src}\``);
            }).catch(err => r(interaction, `There was an error translating: ${err}`));
        } else {
            return translate(message, { to: 'en' }).then(res => {
                return r(interaction, `**Translation:** ${res.text} **Translated from:** \`${res.raw.src}\``);
            }).catch(err => r(interaction, `There was an error translating: ${err}`));
        }
    }
}