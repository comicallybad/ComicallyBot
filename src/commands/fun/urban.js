const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { r } = require("../../../utils/functions/functions.js");
const urban = require('relevant-urban');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('urban')
        .setDescription('Gets an urban dictionary definition')
        .addSubcommand(subcommand => subcommand.setName('search').setDescription('Searches for a term')
            .addStringOption(option => option.setName('term').setDescription('Search term').setRequired(true)))
        .addSubcommand(subcommand => subcommand.setName('random').setDescription('Gets a random definition')),
    execute: async (interaction) => {
        const term = interaction.options.getString('term');

        const res = await urban.random(`${term ? term : ""}`);
        const { word, definition, example, thumbsUp, thumbsDown, urbanURL, author } = res;

        const baseMessage = `**Example:** ${example || "No Example"}\n` +
            `**Upvotes:** ${thumbsUp || 0}\n` +
            `**Downvotes:** ${thumbsDown || 0}\n` +
            `**Link:** [link to ${word}](${urbanURL || "https://www.urbandictionary.com/"})`;

        const maxDefinitionLength = 1024 - baseMessage.length - 20;

        let shortenedDefinition = definition;
        if (definition.length > maxDefinitionLength) {
            shortenedDefinition = `${definition.slice(0, maxDefinitionLength - 15)}... [read more](${urbanURL})`;
        }

        let description = `**Definition:** ${shortenedDefinition}\n` +
            `${baseMessage}`;

        const embed = new EmbedBuilder()
            .setColor("#0efefe")
            .setAuthor({ name: `Urban Dictionary | ${word}` })
            .setDescription(description)
            .setTimestamp()
            .setFooter({ text: `Written by ${author || "unknown"}` });

        return r(interaction, "", embed);
    }
}