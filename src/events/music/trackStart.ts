import { EmbedBuilder, Client, Message, TextChannel } from "discord.js";
import { Player, Track } from "moonlink.js";
import { sendMessage } from "../../utils/messageUtils";
import { savePlayerState } from "../../utils/dbUtils";
import { clearPlayerInterval, createControlRows, updateTimeline, createPlayerInterval } from "../../utils/musicUtils";

const DEFAULT_TIMELINE_LENGTH = 25;
const SHORT_TIMELINE_LENGTH = 20;

export default {
    name: "trackStart",
    execute: async (client: Client, player: Player, track: Track) => {
        clearPlayerInterval(player);
        const guild = await client.guilds.fetch(player.guildId);
        const channel = await client.channels.fetch(player.textChannelId) as TextChannel;
        const requestedBy = track.requester ?? undefined;
        const requester = requestedBy ? await client.users.fetch(requestedBy).catch(() => client.user) : client.user;
        const footerText = `Requested by ${requester?.tag || "Unknown"}`;
        const timelineLength = footerText.length > 30 ? SHORT_TIMELINE_LENGTH : DEFAULT_TIMELINE_LENGTH;
        const embed = new EmbedBuilder()
            .setAuthor({ name: "Now Playing!", iconURL: guild.iconURL() || undefined })
            .setThumbnail(track.thumbnail ?? guild.iconURL() ?? null)
            .setColor("#0EFEFE")
            .setFooter({ text: footerText, iconURL: requester?.displayAvatarURL() || undefined });

        updateTimeline(embed, player, track, timelineLength);

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