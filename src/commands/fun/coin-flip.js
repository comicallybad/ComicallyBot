const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { r } = require("../../../utils/functions/functions.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('coin-flip')
        .setDescription('Flips a coin for heads or tails.'),
    execute: (interaction) => {
        let embed = new EmbedBuilder()
            .setColor("#0efefe")
            .setTitle("A coin was flipped..")
            .setTimestamp()

        let number = Math.floor(Math.random() * 2);

        if (number === 0) embed.addFields({ name: "Result", value: "\`Heads\`" });
        else embed.addFields({ name: "Result", value: "\`Tails\`" });

        return r(interaction, '', embed);;
    }
}