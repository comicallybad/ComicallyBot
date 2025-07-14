import { SlashCommandBuilder, CommandInteraction, InteractionContextType } from "discord.js";
import { sendReply, deleteReply } from "../../utils/replyUtils";

export default {
    data: new SlashCommandBuilder()
        .setName("bot-invite")
        .setDescription("Provides the bot invite link."),
    execute: async (interaction: CommandInteraction) => {
        const botInvite = "https://top.gg/bot/492495421822730250";
        await sendReply(interaction, { content: `The link to invite the bot is: ${botInvite}` });
        await deleteReply(interaction, { timeout: 30000 });
        return;
    },
};