import { Client, TextChannel } from "discord.js";
import { Player } from "moonlink.js";
import { getSavedPlayerState } from "../../utils/dbUtils";
import { createPlayerInterval } from "../../utils/musicUtils";

const DEFAULT_TIMELINE_LENGTH = 25;
const SHORT_TIMELINE_LENGTH = 20;

export default {
    name: "playerResumed",
    execute: async (client: Client, player: Player) => {
        const savedState = await getSavedPlayerState(player.guildId);
        if (!savedState || !savedState.messageId || !savedState.textChannelId) return;

        try {
            const channel = await client.channels.fetch(savedState.textChannelId) as TextChannel;
            if (!channel) return;

            const message = await channel.messages.fetch(savedState.messageId);
            if (!message) return;

            player.data.message = message;
            const track = player.current;
            if (!track) return;

            const requestedBy = track.requester ?? undefined;
            const requester = requestedBy ? await client.users.fetch(requestedBy).catch(() => client.user) : client.user;
            const footerText = `Requested by ${requester?.tag || "Unknown"}`;
            const timelineLength = footerText.length > 30 ? SHORT_TIMELINE_LENGTH : DEFAULT_TIMELINE_LENGTH;

            let timelineUpdateInterval;
            const trackDuration = track.duration || 0;

            if (trackDuration <= 300000) {
                timelineUpdateInterval = 10000;
            } else if (trackDuration <= 600000) {
                timelineUpdateInterval = 15000;
            } else {
                timelineUpdateInterval = 30000;
            }

            createPlayerInterval(message, player, track, timelineLength, timelineUpdateInterval);
        } catch (error) {
            return;
        }
    },
};
