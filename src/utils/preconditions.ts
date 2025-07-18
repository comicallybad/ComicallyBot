import { ChatInputCommandInteraction, MessageFlags } from "discord.js";
import { sendReply } from "./replyUtils";

/**
 * Checks if the bot can communicate in the channel where the interaction occurred.
 * @param interaction The chat input command interaction.
 * @returns A Promise that resolves to true if the bot can communicate, false otherwise.
 */
export async function canCommunicate(interaction: ChatInputCommandInteraction): Promise<boolean> {
    if (interaction.guild?.members.me?.isCommunicationDisabled()) {
        await sendReply(interaction, {
            content: "I am currently communication-disabled in this server and cannot respond to commands.",
            flags: MessageFlags.Ephemeral
        });
        return false;
    }
    return true;
}