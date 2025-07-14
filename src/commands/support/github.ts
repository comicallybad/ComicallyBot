import { SlashCommandBuilder, CommandInteraction, InteractionContextType } from "discord.js";
import { sendReply, deleteReply } from "../../utils/replyUtils";

export default {
    data: new SlashCommandBuilder()
        .setName("github")
        .setDescription("Provides a link to the GitHub repository."),
    execute: async (interaction: CommandInteraction) => {
        const githubLink = "https://github.com/comicallybad/comicallybot";
        await sendReply(interaction, { content: `The link to the GitHub repository is: ${githubLink}` });
        await deleteReply(interaction, { timeout: 30000 });
    },
};