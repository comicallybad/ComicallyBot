import { Client, VoiceState } from "discord.js";

const disconnectTimers = new Map<string, NodeJS.Timeout>();

export default {
    name: "voiceStateUpdate",
    execute(client: Client, oldState: VoiceState, newState: VoiceState) {
        if (!client.user) return;

        const botId = client.user.id;

        if (
            newState.member?.id === botId &&
            newState.channelId &&
            oldState.sessionId !== newState.sessionId
        ) {
            client.emit(`botVoiceChannelConnect:${newState.guild.id}`);
        }

        const oldChannel = oldState.channel;
        const newChannel = newState.channel;

        const isBotAlone = (channel: VoiceState["channel"]) => {
            return channel && channel.members.size === 1 && channel.members.has(botId);
        };

        // User leaves a channel or moves to another
        if (oldChannel && (!newChannel || oldChannel.id !== newChannel.id)) {
            if (isBotAlone(oldChannel)) {
                const timer = setTimeout(() => {
                    const player = client.music.players.get(oldChannel.guild.id);
                    if (player) {
                        player.disconnect();
                        player.destroy();
                    }
                    disconnectTimers.delete(oldChannel.id);
                }, 180000); // 3 minutes

                disconnectTimers.set(oldChannel.id, timer);
            }
        }

        // User joins a channel
        if (newChannel) {
            // If a disconnect timer was running for the channel the user joined, cancel it
            if (disconnectTimers.has(newChannel.id)) {
                clearTimeout(disconnectTimers.get(newChannel.id)!);
                disconnectTimers.delete(newChannel.id);
            }
        }
    },
};
