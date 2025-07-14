import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import { sendReply, deleteReply } from "../../utils/replyUtils";

export default {
    data: new SlashCommandBuilder()
        .setName("support")
        .setDescription("Provides a link to the support server."),
    execute: async (interaction: CommandInteraction) => {
        const supportServer = "Discord: https://discord.gg/sWaW7ntwKu";
        await sendReply(interaction, { content: `The link to the support server is: ${supportServer}` });
        await deleteReply(interaction, { timeout: 30000 });
    },
};