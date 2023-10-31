const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription('Returns ping and latency of the bot.'),
    async execute(client, interaction) {
        const message = await interaction.deferReply({
            fetchReply: true
        });

        await interaction.editReply({
            content: `Api Latency: ${client.ws.ping}\nClient Ping: ${message.createdTimestamp - interaction.createdTimestamp}`
        });
    }
}