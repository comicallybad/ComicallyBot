const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { r, re } = require("../../../utils/functions/functions.js");
var wd = require("word-definition");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('define')
        .setDescription('Defines a word for you.')
        .addStringOption(option => option.setName('word').setDescription('Word to define').setRequired(true)),
    execute: (interaction) => {
        const word = interaction.options.getString('word');
        const user = interaction.user;

        wd.getDef(word, "en", null, function (result) {
            if (!result.definition)
                return re(interaction, "Sorry, I could not find that word.");

            if (result.definition.length >= 1024)
                return re(interaction, "This definition is too long of a string for a message embed sorry!");

            const embed = new EmbedBuilder()
                .setColor("#0efefe")
                .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
                .setTitle(`Definition of: ${word}`)
                .setDescription(result.definition)
                .setFooter({ text: `Category of type: ${result.category}` })
                .setTimestamp();

            return r(interaction, "", embed);
        });
    }
}