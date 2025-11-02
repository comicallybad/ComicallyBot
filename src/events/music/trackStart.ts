import { EmbedBuilder, Client, Message, TextChannel } from "discord.js";
import { Player, Track } from "moonlink.js";
import humanizeDuration from "humanize-duration";
import { sendMessage, editMessage } from "../../utils/messageUtils";
import { formatSongTitle } from "../../utils/stringUtils";
import { savePlayerState, deletePlayerState } from "../../utils/dbUtils";
import { clearPlayerInterval, createControlRows } from "../../utils/musicUtils";

const DEFAULT_TIMELINE_LENGTH = 25;
const SHORT_TIMELINE_LENGTH = 20;

export default {
    name: "trackStart",
    execute: async (client: Client, player: Player, track: Track) => {
        clearPlayerInterval(player);
        const guild = await client.guilds.fetch(player.guildId);
        const channel = await client.channels.fetch(player.textChannelId) as TextChannel;
        const requestedBy = track.requestedBy && typeof track.requestedBy === 'object' && 'id' in track.requestedBy ? String(track.requestedBy.id) : undefined;
        const requester = requestedBy ? await client.users.fetch(requestedBy).catch(() => client.user) : client.user;
        const footerText = `Requested by ${requester?.tag || "Unknown"}`;
        const timelineLength = footerText.length > 30 ? SHORT_TIMELINE_LENGTH : DEFAULT_TIMELINE_LENGTH;
        const embed = new EmbedBuilder()
            .setAuthor({ name: "Now Playing!", iconURL: guild.iconURL() || undefined })
            .setThumbnail(track.getThumbnailUrl() ?? guild.iconURL() ?? null)
            .setColor("#0EFEFE")
            .setFooter({ text: footerText, iconURL: requester?.displayAvatarURL() || undefined });

        updateTimeline(embed, player, track, timelineLength);

        if (player.data.isRestored && player.data.wasPaused) {
            embed.addFields([{ name: "Player Paused", value: "⏯ The player is currently **paused**." }]);
        }

        if (player.data.isRestored) {
            if (player.data.wasPaused) {
                player.pause();
            }
            delete player.data.isRestored;
            delete player.data.wasPaused;
        }

        const rows = createControlRows();
        const sentMessage = await sendMessage(channel, { embeds: [embed], components: rows });
        if (sentMessage) {
            player.data.message = sentMessage;

            let timelineUpdateInterval;
            const trackDuration = track.duration || 0;

            if (trackDuration <= 300000) {
                timelineUpdateInterval = 10000;
            } else if (trackDuration <= 600000) {
                timelineUpdateInterval = 15000;
            } else {
                timelineUpdateInterval = 30000;
            }

            createPlayerInterval(sentMessage, player, track, timelineLength, timelineUpdateInterval);
            await savePlayerState(player);
        }
    },
};

function updateTimeline(embed: EmbedBuilder, player: Player, track: Track, timelineLength: number) {
    const formattedTitle = formatSongTitle(track.title || "", track.author || "", track.url || "");

    if (track.isStream) {
        embed.setDescription(`▶️ ${formattedTitle} \`LIVE\`\n${'▬'.repeat(timelineLength)}🔘\n\`${humanizeDuration(player.current.position ?? 0, { round: true })}\``);
    } else {
        const currentPosition = Math.floor((player.current.position || 0) / 1000);
        const totalLength = Math.floor((track.duration || 0) / 1000);
        const markerPosition = totalLength > 0 ? Math.round((currentPosition / totalLength) * timelineLength) : 0;
        const timelineArray = '▬'.repeat(timelineLength + 1).split('');

        if (markerPosition >= 0 && markerPosition < timelineArray.length) {
            timelineArray[markerPosition] = '🔘';
        }

        embed.setDescription(`▶️ ${formattedTitle} ` + "`" + `${humanizeDuration(track.duration ?? 0, { round: true })}` + "`" + `\n${timelineArray.join('')}\n` + "`" + `${humanizeDuration(player.current.position ?? 0, { round: true })}` + "`");
    }
}

function createPlayerInterval(message: Message, player: Player, track: Track, timelineLength: number, interval: number) {
    player.data.timelineInterval = setInterval(async () => {
        if (player.destroyed) {
            await deletePlayerState(player.guildId);
            clearPlayerInterval(player);
            return;
        }

        if (!player || !player.current || !player.data.message || !message.embeds[0]?.toJSON) {
            clearPlayerInterval(player);
            return;
        }

        const embed = new EmbedBuilder(message.embeds[0].toJSON());
        updateTimeline(embed, player, track, timelineLength);

        try {
            await editMessage(message, { embeds: [embed] });
            await savePlayerState(player);
        } catch (error: unknown) {
            clearPlayerInterval(player);
            return;
        }
    }, interval);
}