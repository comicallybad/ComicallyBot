import {
    SlashCommandBuilder, ChannelType, PermissionFlagsBits, ChatInputCommandInteraction,
    CategoryChannel, TextChannel, InteractionContextType
} from "discord.js";
import { sendReply, deleteReply } from "../../utils/replyUtils";
import * as dotenv from "dotenv";
import { ValidationError } from "../../utils/customErrors";

dotenv.config();

export default {
    data: new SlashCommandBuilder()
        .setName("create-log-channels")
        .setDescription("Create log channels")
        .setContexts(InteractionContextType.Guild)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    execute: async (interaction: ChatInputCommandInteraction) => {
        await createChannels(interaction);
        await sendReply(interaction, { content: "Log channels created successfully." });
        await deleteReply(interaction, { timeout: 30000 });
    },
};

async function createChannels(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) {
        throw new ValidationError("This command can only be used in a server.");
    }

    const everyoneRoleId = interaction.guild.roles.everyone.id;
    const botId = interaction.client.user.id;
    const channelNames = ["mod-logs", "member-logs", "role-logs", "text-logs", "action-logs", "reports"];
    const permissionOverwrites = [
        { id: everyoneRoleId, deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AddReactions, PermissionFlagsBits.ManageMessages] },
        { id: botId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AddReactions, PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ManageChannels] },
    ];

    let categoryChannel = interaction.guild.channels.cache.find(c => c.name.includes("Logging") && c.type === ChannelType.GuildCategory) as CategoryChannel | undefined;

    try {
        if (!categoryChannel || !categoryChannel.permissionsFor(botId)?.has(PermissionFlagsBits.ManageChannels)) {
            categoryChannel = await interaction.guild.channels.create({
                name: "📃︱Logging",
                type: ChannelType.GuildCategory,
                permissionOverwrites: permissionOverwrites,
            }) as CategoryChannel;
        }
    } catch (error) {
        throw new ValidationError(`Failed to create or access category channel: ${(error as Error).message}`);
    }

    for (const channelName of channelNames) {
        let channel = interaction.guild.channels.cache.find(c => c.name.includes(channelName)) as TextChannel | undefined;
        try {
            if (!channel) {
                channel = await interaction.guild.channels.create({
                    name: `📃︱${channelName}`,
                    type: ChannelType.GuildText,
                    parent: categoryChannel.id,
                    permissionOverwrites: permissionOverwrites,
                }) as TextChannel;
            } else if (channel.parentId !== categoryChannel.id) {
                await channel.setParent(categoryChannel.id);
            }
        } catch (error) {
            throw new ValidationError(`Failed to create or update channel ${channelName}: ${(error as Error).message}`);
        }
    }
}