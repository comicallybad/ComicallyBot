import {
    SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits,
    ChatInputCommandInteraction, InteractionContextType, ButtonInteraction
} from "discord.js";
import { sendReply, deleteReply, editReply } from "../../utils/replyUtils";
import { sendMessage } from "../../utils/messageUtils";
import { messagePrompt } from "../../utils/paginationUtils";
import { getLogChannel } from "../../utils/channelUtils";
import { PermissionError, ValidationError } from "../../utils/customErrors";

export default {
    data: new SlashCommandBuilder()
        .setName("unban")
        .setDescription("Unban a member.")
        .setContexts(InteractionContextType.Guild)
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addUserOption(option => option.setName("user").setDescription("The user to unban").setRequired(true))
        .addStringOption(option => option.setName("reason").setDescription("The reason for unbanning the user").setMaxLength(1024)),
    execute: async (interaction: ChatInputCommandInteraction) => {
        if (!interaction.guild?.members.me?.permissions.has(PermissionFlagsBits.BanMembers)) {
            throw new PermissionError("I don't have permission to `Ban Members`.");
        }

        const logChannel = getLogChannel(interaction.guild!, ["action-logs"]);
        const bannedUser = interaction.options.getUser("user", true);
        const reason = interaction.options.getString("reason") || "No reason provided";

        if (bannedUser.id === interaction.user.id || bannedUser.id === interaction.client.user.id) {
            throw new ValidationError("I can't perform this action.");
        }

        const promptEmbed = new EmbedBuilder()
            .setColor("#00ff00")
            .setAuthor({ name: `This verification becomes invalid after 30s.`, iconURL: interaction.user.displayAvatarURL() })
            .setDescription(`Do you want to unban ${bannedUser}?`);

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder().setCustomId("confirm").setLabel("Confirm").setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId("cancel").setLabel("Cancel").setStyle(ButtonStyle.Danger)
            );

        await sendReply(interaction, { embeds: [promptEmbed.toJSON()], components: [row.toJSON()] });

        try {
            const collectedInteraction = await messagePrompt(interaction, row, 30000) as ButtonInteraction;

            if (collectedInteraction.customId === "cancel") {
                await editReply(interaction, { content: "Selection cancelled.", embeds: [], components: [] });
                await deleteReply(interaction, { timeout: 15000 });
                return;
            }

            if (collectedInteraction.customId === "confirm") {
                await interaction.guild.members.unban(bannedUser.id, reason);
                const embed = new EmbedBuilder()
                    .setColor("#00ff00")
                    .setTitle("Member Unbanned")
                    .setThumbnail(bannedUser.displayAvatarURL())
                    .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                    .setTimestamp()
                    .addFields({
                        name: "__**Target**__",
                        value: `${bannedUser}`,
                        inline: true
                    }, {
                        name: "__**Reason**__",
                        value: `${reason}`,
                        inline: true

                    }, {
                        name: "__**Moderator**__",
                        value: `${interaction.user}`,
                        inline: true
                    });

                if (logChannel) await sendMessage(logChannel, { embeds: [embed.toJSON()] });
                await editReply(interaction, { content: "Member unbanned.", embeds: [], components: [] });
                await deleteReply(interaction, { timeout: 15000 });
            }
        } catch (err: unknown) {
            if (err === "time") {
                throw new ValidationError("Prompt timed out.");
            } else {
                throw err;
            }
        }
    },
};