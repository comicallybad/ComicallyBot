import { SlashCommandBuilder, CommandInteraction, InteractionContextType } from "discord.js";
import { sendReply, deleteReply } from "../../utils/replyUtils";

export default {
    data: new SlashCommandBuilder()
        .setName("donate")
        .setDescription("Provides the donation link."),
    execute: async (interaction: CommandInteraction) => {
        const donationLink = "https://www.linktr.ee/comicallybad";
        await sendReply(interaction, { content: `The link to donate is: ${donationLink}` });
        await deleteReply(interaction, { timeout: 30000 });
        return;
    },
};