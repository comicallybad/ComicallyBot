const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { r, re, delr } = require("../../../utils/functions/functions.js");
const urban = require('relevant-urban');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('urban')
        .setDescription('Gets an urban dictionary definition')
        .addSubcommand(subcommand =>
            subcommand.setName('search').setDescription('Searches for a term')
                .addStringOption(option => option.setName('term').setDescription('Search term').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('random').setDescription('Gets a random definition')),
    execute: async (interaction) => {
        const term = interaction.options.getString('term');

        const res = await urban.random(`${term ? term : ""}`);
        let { word, definition, example, thumbsUp, thumbsDown, urbanURL, author } = res;

        let description = `**Defintion:** ${definition || "No definition"}
                **Example:** ${example || "No Example"}
                **Upvotes:** ${thumbsUp || 0}
                **Downvotes:** ${thumbsDown || 0}
                **Link:** [link to ${word}](${urbanURL || "https://www.urbandictionary.com/"})`

        if (description.length >= 1024)
            return re(interaction, "This definition is too long of a string for a message embed sorry!").then(() => delr(interaction, 7500));

        let embed = new EmbedBuilder()
            .setColor("#0efefe")
            .setAuthor({ name: `Urban Dictionary | ${word}` })
            .setDescription(description)
            .setTimestamp()
            .setFooter({ text: `Written by ${author || "unknown"}` });

        return r(interaction, "", embed);
    }
}