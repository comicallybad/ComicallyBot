const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { r, re, delr } = require("../../../utils/functions/functions.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('vote')
        .setDescription('Sends a message users can vote on.')
        .addStringOption(option => option.setName('input').setDescription('What will be voted on').setRequired(true)),
    execute: async (interaction) => {
        let input = interaction.options.getString('input');

        if (input.length >= 1024) {
            return re(interaction, "You can only use a string less than 2048 characters!").then(() => delr(interaction, 7500));
        }

        const embed = new EmbedBuilder()
            .setColor("#0efefe")
            .setAuthor({ name: `${interaction.member.displayName}`, iconURL: interaction.user.displayAvatarURL() })
            .setDescription(`${input}`)
            .setFooter({ text: `Select a reaction below to vote on` })
            .setTimestamp();

        await r(interaction, "", embed);
        const message = await interaction.fetchReply();
        await message.react("⬆️");
        return message.react("⬇️");
    }
};