const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription('Returns ping and latency of the bot.'),
    execute: async (interaction, client) => {
        await interaction.deferReply();

        const message = await interaction.fetchReply();

        await interaction.editReply({
            content: `Api Latency: ${client.ws.ping}\nClient Ping: ${message.createdTimestamp - interaction.createdTimestamp}`
        });
    }
}