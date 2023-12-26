const { SlashCommandBuilder } = require('discord.js');
const { re, delr } = require("../../../utils/functions/functions.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('support')
        .setDescription('Provides the support server for the bot.'),
    execute: (interaction) => {
        const supportServer = "Discord: https://discord.gg/mC4J2eETNv";
        return re(interaction, `The support server for the discord bot is: ${supportServer}`).then(() => delr(interaction, 30000));
    },
};