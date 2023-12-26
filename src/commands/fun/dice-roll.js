const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { r } = require("../../../utils/functions/functions.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dice-roll')
        .setDescription('Rolls a dice for a number 1-6.'),
    execute: (interaction) => {
        let embed = new EmbedBuilder()
            .setColor("#0efefe")
            .setTitle("A dice was rolled..")
            .setTimestamp()

        let number = Math.floor(Math.random() * 6);
        let images =
            ["https://upload.wikimedia.org/wikipedia/commons/2/2c/Alea_1.png",
                "https://upload.wikimedia.org/wikipedia/commons/b/b8/Alea_2.png",
                "https://upload.wikimedia.org/wikipedia/commons/2/2f/Alea_3.png",
                "https://upload.wikimedia.org/wikipedia/commons/8/8d/Alea_4.png",
                "https://upload.wikimedia.org/wikipedia/commons/5/55/Alea_5.png",
                "https://upload.wikimedia.org/wikipedia/commons/f/f4/Alea_6.png"]

        embed.setImage(images[number]);

        return r(interaction, '', embed);
    }
};