const { SlashCommandBuilder } = require('discord.js');
const { re, delr } = require("../../../utils/functions/functions.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bot-invite')
        .setDescription('Provides a link to share the bot with others.'),
    execute: (interaction) => {
        const botInvite = "https://top.gg/bot/492495421822730250";
        return re(interaction, `The link to invite the bot is: ${botInvite}`).then(() => delr(interaction, 30000));
    },
};