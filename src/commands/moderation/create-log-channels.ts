import {
    SlashCommandBuilder, ChannelType, PermissionFlagsBits, ChatInputCommandInteraction,
    CategoryChannel, TextChannel, InteractionContextType
} from "discord.js";
import { sendReply, deleteReply } from "../../utils/replyUtils";
import * as dotenv from "dotenv";
import { ValidationError, PermissionError } from "../../utils/customErrors";

dotenv.config();

export default {
    data: new SlashCommandBuilder()
        .setName("create-log-channels")
        .setDescription("Create log channels")
        .setContexts(InteractionContextType.Guild)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    execute: async (interaction: ChatInputCommandInteraction) => {
        if (!interaction.guild || !interaction.guild.members.me) {
            throw new ValidationError("This command can only be used in a guild.");
        }

        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels)) {
            throw new PermissionError("I do not have permissions to manage channels in this guild.");
        }

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
        {
            id: everyoneRoleId,
            deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AddReactions, PermissionFlagsBits.ManageMessages]
        },
        {
            id: botId,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AddReactions, PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ManageChannels
            ]
        },
    ];

    let categoryChannel = interaction.guild.channels.cache.find(c => c.name.includes("Logging") && c.type === ChannelType.GuildCategory) as CategoryChannel | undefined;

    if (!categoryChannel || !categoryChannel.permissionsFor(botId)?.has(PermissionFlagsBits.ManageChannels)) {
        categoryChannel = await interaction.guild.channels.create({
            name: "📃︱Logging",
            type: ChannelType.GuildCategory,
            permissionOverwrites: permissionOverwrites,
        }) as CategoryChannel;
    }

    for (const channelName of channelNames) {
        let channel = interaction.guild.channels.cache.find(c => c.name.includes(channelName)) as TextChannel | undefined;
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
    }
}