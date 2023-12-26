const { SlashCommandBuilder } = require('discord.js');
const { re, delr } = require("../../../utils/functions/functions.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('github')
        .setDescription('Sends a link to the open source Github for the bot.'),
    execute: (interaction) => {
        const githubLink = "https://github.com/comicallybad/comicallybot";
        return re(interaction, `Here is the link to the open source Github: ${githubLink}`).then(() => delr(interaction, 30000));
    },
};