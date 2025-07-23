import { SlashCommandBuilder, ChatInputCommandInteraction, DMChannel, MessageFlags, InteractionContextType, PermissionsBitField } from "discord.js";
import { sendReply, editReply } from "../../utils/replyUtils";
import { PermissionError, ValidationError } from "../../utils/customErrors";

export default {
    ownerOnly: true,
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
        const fetchedChannel = await interaction.client.channels.fetch(process.env.DM_CHANNEL_ID).catch(() => null);
        if (!fetchedChannel || !(fetchedChannel instanceof DMChannel)) {
            throw new ValidationError("Could not find the specified DM channel.");
        }
        dmChannel = fetchedChannel;

        await sendReply(interaction, { content: "Now cleaning your DM's...", flags: MessageFlags.Ephemeral });

        const fetchedMessages = await dmChannel.messages.fetch({ limit: 100 });
        const botMessages = fetchedMessages.filter(m => m.author.id === interaction.client.user?.id);

        if (botMessages.size === 0) {
            await editReply(interaction, { content: "No bot messages found in the DM channel to delete." });
            return;
        }

        for (const message of botMessages.values()) {
            await message.delete();
        }

        await editReply(interaction, { content: `Successfully deleted ${botMessages.size} messages from your DM channel.` });
    },
};