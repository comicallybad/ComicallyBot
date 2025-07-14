import { ChatInputCommandInteraction, MessageFlags } from "discord.js";
import { sendReply } from "./replyUtils";

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