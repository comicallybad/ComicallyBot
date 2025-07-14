import { SlashCommandBuilder, ChatInputCommandInteraction, DMChannel, MessageFlags, InteractionContextType, DiscordAPIError, PermissionsBitField } from "discord.js";
import { sendReply, deleteReply, editReply } from "../../utils/replyUtils";
import { PermissionError, ValidationError } from "../../utils/customErrors";
import { logError } from "../../utils/logUtils";

export default {
    data: new SlashCommandBuilder()
        .setName("clean_dms")
        .setDescription("Cleans DM messages from bot to owner (Owner Only).")
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .setContexts(InteractionContextType.Guild),
    async execute(interaction: ChatInputCommandInteraction) {
        if (interaction.user.id !== process.env.BOT_OWNER_ID) {
            throw new PermissionError("This command can only be used by the bot owner.");
        }

        if (!process.env.DM_CHANNEL_ID) {
            throw new ValidationError("DM_CHANNEL_ID environment variable is not set.");
        }

        let dmChannel: DMChannel;
        try {
            const fetchedChannel = await interaction.client.channels.fetch(process.env.DM_CHANNEL_ID);
            if (!fetchedChannel || !(fetchedChannel instanceof DMChannel)) {
                throw new ValidationError("Could not find the specified DM channel.");
            }
            dmChannel = fetchedChannel;
        } catch (error) {
            if (error instanceof DiscordAPIError && error.code === 50001) {
                throw new PermissionError("Missing access to the specified DM channel. Please check bot permissions.");
            } else {
                logError(error, "Error fetching DM channel");
                throw new Error("An unexpected error occurred while fetching the DM channel.");
            }
        }

        await sendReply(interaction, { content: "Now cleaning your DM's...", flags: MessageFlags.Ephemeral });

        try {
            const fetchedMessages = await dmChannel.messages.fetch({ limit: 100 });
            const botMessages = fetchedMessages.filter(m => m.author.id === interaction.client.user?.id);

            if (botMessages.size === 0) {
                await editReply(interaction, { content: "No bot messages found in the DM channel to delete." });
                await deleteReply(interaction, { timeout: 7500 });
                return;
            }

            for (const message of botMessages.values()) {
                await message.delete().catch(error => {
                    if (error instanceof DiscordAPIError && error.code === 50001) {
                        throw new PermissionError("Missing access to delete messages in the DM channel. Please check bot permissions.");
                    } else {
                        logError(error, "Failed to delete message");
                        throw error;
                    }
                });
            }

            await editReply(interaction, { content: `Successfully deleted ${botMessages.size} messages from your DM channel.` });
            await deleteReply(interaction, { timeout: 7500 });

        } catch (error) {
            if (error instanceof PermissionError) {
                throw error;
            } else {
                logError(error, "Error cleaning DMs");
                throw new Error("An unexpected error occurred while cleaning DMs.");
            }
        }
    },
};