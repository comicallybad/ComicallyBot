import {
    SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits,
    MessageFlags, Collection, Message, TextChannel, InteractionContextType
} from "discord.js";
import { deferReply, deleteReply, editReply } from "../../utils/replyUtils";
import { PermissionError, ValidationError } from "../../utils/customErrors";

export default {
    data: new SlashCommandBuilder()
        .setName("clear")
        .setDescription("Clears messages from a channel.")
        .setContexts(InteractionContextType.Guild)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addIntegerOption(option => option.setName("amount").setDescription("Number of messages to clear.").setMinValue(1).setMaxValue(100).setRequired(true))
        .addUserOption(option => option.setName("user").setDescription("User to clear messages from.")),
    execute: async (interaction: ChatInputCommandInteraction) => {
        const { channel, guild } = interaction;
        if (!channel || !guild || !(channel instanceof TextChannel)) {
            throw new ValidationError("This command can only be used in a server's text channel.");
        }

        const me = guild.members.me;
        if (!me) {
            throw new ValidationError("I couldn't find myself in the server.");
        }

        if (!channel.permissionsFor(me).has(PermissionFlagsBits.ManageMessages)) {
            throw new PermissionError("I do not have permissions to Delete Messages.");
        }

        const user = interaction.options.getUser("user");
        const amount = interaction.options.getInteger("amount", true);

        await deferReply(interaction, { flags: MessageFlags.Ephemeral });

        const fetchedMessages: Collection<string, Message> = await channel.messages.fetch({ limit: 100 });
        let filteredMessages: Collection<string, Message>;

        if (user) filteredMessages = fetchedMessages.filter(m => m.author.id === user.id);
        else filteredMessages = fetchedMessages;

        const messagesToDelete = [...filteredMessages.values()].slice(0, amount);

        if (messagesToDelete.length === 0) {
            await editReply(interaction, { content: "No messages found to delete." });
            await deleteReply(interaction, { timeout: 7500 });
            return;
        }

        const deletedMessages = await channel.bulkDelete(messagesToDelete, true);

        await editReply(interaction, { content: `Successfully deleted ${deletedMessages.size} messages.` });
    }
};