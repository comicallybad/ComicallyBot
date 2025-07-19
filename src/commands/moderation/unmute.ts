import {
    SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits,
    ChatInputCommandInteraction, GuildMember, InteractionContextType, ButtonInteraction, MessageFlags, DiscordAPIError
} from "discord.js";
import { sendReply, deleteReply } from "../../utils/replyUtils";
import { sendMessage } from "../../utils/messageUtils";
import { messagePrompt } from "../../utils/paginationUtils";
import { getLogChannel } from "../../utils/channelUtils";
import { PermissionError, ValidationError } from "../../utils/customErrors";

export default {
    data: new SlashCommandBuilder()
        .setName("unmute")
        .setDescription("Remove timeout from a member.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .setContexts(InteractionContextType.Guild)
        .addUserOption(option => option.setName("user").setDescription("The user to unmute").setRequired(true))
        .addStringOption(option => option.setName("reason").setDescription("The reason for unmuting the user").setMaxLength(1024)),
    execute: async (interaction: ChatInputCommandInteraction) => {
        if (!interaction.guild?.members.me?.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            throw new PermissionError("I don't have permission to `Moderate Members`.");
        }

        const logChannel = getLogChannel(interaction.guild!, ["action-logs"]);
        const mutee = interaction.options.getMember("user") as GuildMember;
        const reason = interaction.options.getString("reason") || "No reason provided";

        if (mutee.id === interaction.user.id || mutee.id === interaction.client.user.id) {
            throw new ValidationError("I can't perform this action.");
        }

        const promptEmbed = new EmbedBuilder()
            .setColor("#00ff00")
            .setAuthor({ name: `This verification becomes invalid after 30s.`, iconURL: interaction.user.displayAvatarURL() })
            .setDescription(`Do you want to remove ${mutee}'s timeout?`);

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder().setCustomId("confirm").setLabel("Confirm").setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId("cancel").setLabel("Cancel").setStyle(ButtonStyle.Danger)
            );

        await sendReply(interaction, { embeds: [promptEmbed], components: [row] });

        try {
            const collectedInteraction = await messagePrompt(interaction, row, 30000) as ButtonInteraction;

            if (collectedInteraction.customId === "cancel") {
                await sendReply(interaction, { content: "Selection cancelled.", flags: MessageFlags.Ephemeral });
                await deleteReply(interaction, { timeout: 0 });
                return;
            }

            if (collectedInteraction.customId === "confirm") {
                try {
                    await mutee.timeout(null);
                    const embed = new EmbedBuilder()
                        .setColor("#00ff00")
                        .setTitle("Member Timeout Removed")
                        .setThumbnail(mutee.user.displayAvatarURL())
                        .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                        .setTimestamp()
                        .addFields(
                            { name: "__**Target**__", value: `${mutee}`, inline: true },
                            { name: "__**Reason**__", value: `${reason}`, inline: true },
                            { name: "__**Moderator**__", value: `${interaction.user}`, inline: true }
                        );

                    if (logChannel) await sendMessage(logChannel, { embeds: [embed] });
                    await sendReply(interaction, { content: "Timeout removed.", flags: MessageFlags.Ephemeral });
                    await deleteReply(interaction, { timeout: 0 });
                } catch (error: unknown) {
                    if (error instanceof DiscordAPIError && error.code === 50013) {
                        throw new PermissionError("I do not have the necessary permissions to remove this user's timeout.");
                    }
                    throw error;
                }
            }
        } catch (err: unknown) {
            if (err === "time") {
                await deleteReply(interaction, { timeout: 0 });
                throw new ValidationError("Prompt timed out.");
            } else {
                throw err;
            }
        }
    },
};