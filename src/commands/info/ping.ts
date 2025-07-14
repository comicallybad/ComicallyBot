import { SlashCommandBuilder, CommandInteraction, Client } from "discord.js";
import { sendReply, editReply } from "../../utils/replyUtils";

export default {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Returns ping and latency of the bot."),
    execute: async (interaction: CommandInteraction, client: Client) => {
        await sendReply(interaction, { content: "Pinging..." });

        const message = await interaction.fetchReply();

        await editReply(interaction, {
            content: `Api Latency: ${client.ws.ping}ms
Client Ping: ${message.createdTimestamp - interaction.createdTimestamp}ms`
        });
    }
};