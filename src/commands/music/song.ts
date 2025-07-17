import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, Client, InteractionContextType } from "discord.js";
import humanizeDuration from "humanize-duration";
import { sendReply, deleteReply } from "../../utils/replyUtils";
import { formatSongTitle } from "../../utils/stringUtils";
import { ValidationError } from "../../utils/customErrors";

export default {
    data: new SlashCommandBuilder()
        .setName("song")
        .setDescription("Displays what song is currently playing.")
        .setContexts(InteractionContextType.Guild),
    execute: async (interaction: ChatInputCommandInteraction, client: Client) => {
        const player = client.music.players.get(interaction.guildId!);

        if (!player || !player.current) {
            throw new ValidationError("No song(s) currently playing in this guild.");
        }

        const { title, author, duration, position, url, requestedBy } = player.current;
        const songTitle = title ?? "";
        const songAuthor = author ?? "";
        const songUrl = url ?? "";
        const requester = requestedBy && typeof requestedBy === 'object' && 'id' in requestedBy ? await client.users.fetch(requestedBy.id as string) : null;

        const embed = new EmbedBuilder()
            .setAuthor({ name: "Current Song!", iconURL: interaction.guild?.iconURL() || undefined })
            .setThumbnail(player.current.getThumbnailUrl() ?? interaction.guild?.iconURL() ?? null)
            .setColor("#0EFEFE")
            .setDescription(`${!player.paused ? "▶️" : "⏸️"} ${formatSongTitle(songTitle, songAuthor, songUrl)} ${humanizeDuration(duration, { round: true })}
            __**Currently at:**__ \`${humanizeDuration(position, { round: true })}\``)
            .setFooter({ text: `Requested by ${requester?.tag || "Unknown"}`, iconURL: requester?.displayAvatarURL() || undefined });

        await sendReply(interaction, { embeds: [embed.toJSON()] });
        await deleteReply(interaction, { timeout: 30000 });
    }
};