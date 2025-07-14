import { SlashCommandBuilder, PermissionsBitField, EmbedBuilder, ChatInputCommandInteraction, InteractionContextType } from "discord.js";
import { sendReply, deleteReply } from "../../utils/replyUtils";
import { pageList } from "../../utils/paginationUtils";
import { PermissionError, ValidationError } from "../../utils/customErrors";

export default {
    data: new SlashCommandBuilder()
        .setName("invites")
        .setDescription("Provides server invite links.")
        .setContexts(InteractionContextType.Guild),
    execute: async (interaction: ChatInputCommandInteraction) => {
        const guild = interaction.guild!;

        if (!guild.members.me?.permissions.has(PermissionsBitField.Flags.ViewAuditLog)) {
            throw new PermissionError("I need the `View Audit Log` permission to fetch invites.");
        }

        const invitesCollection = await interaction.guild!.invites.fetch().catch(() => { return null; });

        if (!invitesCollection) {
            throw new ValidationError("There was an error fetching invites.");
        }

        const amount = invitesCollection.size;

        if (!(amount > 0)) {
            throw new ValidationError("There are no server invites created.");
        }

        const invitesArray: string[] = invitesCollection
            .sort((x, y) => (y.uses ?? 0) - (x.uses ?? 0))
            .map(invite => {
                if (invite.inviter) {
                    const uses = invite.uses ?? 0;
                    return `\`${invite.code}\` made by **${invite.inviter.username}** with \`${uses}\` uses.`;
                }
                return `\`${invite.code}\` (Inviter unknown) with \`${invite.uses ?? 0}\` uses.`;
            });

        const embed = new EmbedBuilder()
            .setTitle("Server Invites")
            .setColor("#0efefe")
            .setTimestamp();

        if (invitesArray.length <= 10) {
            invitesArray.forEach((invite, index) => {
                embed.addFields({ name: `Invite #${index + 1}:`, value: `${invite}` });
            });
            await sendReply(interaction, { embeds: [embed.toJSON()] });
            await deleteReply(interaction, { timeout: 30000 });
        } else {
            await sendReply(interaction, { embeds: [embed.toJSON()] });
            await pageList(interaction, invitesArray, embed, "Invite #", 10, 0);
        }
    }
};