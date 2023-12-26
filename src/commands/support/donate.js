const { SlashCommandBuilder } = require('discord.js');
const { re, delr } = require("../../../utils/functions/functions.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('donate')
        .setDescription('Provides a link to support the creator of the bot ❤️.'),
    execute: (interaction) => {
        const donationLink = "https://www.linktr.ee/comicallybad";
        return re(interaction, `The donation link to support the bot creator is: ${donationLink}`).then(() => delr(interaction, 30000));
    },
};