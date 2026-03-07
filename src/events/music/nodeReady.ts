import { Client, EmbedBuilder, TextChannel } from "discord.js";
import { Node } from "moonlink.js";
import { getAllSavedPlayerStates, deletePlayerState } from "../../utils/dbUtils";
import { sendMessage, deleteMessage } from "../../utils/messageUtils";
import { logError, formatLogTimestamp } from "../../utils/logUtils";

export default {
    name: "nodeReady",
    execute: async (client: Client, node: Node) => {
        console.log(`${formatLogTimestamp()} [SUCCESS] Lavalink Node ${node.identifier} ready.`);

        setTimeout(() => {
            restoreSavedPlayerStates(client);
        }, 5000);
    },
};

async function restoreSavedPlayerStates(client: Client) {
    const savedPlayerStates = await getAllSavedPlayerStates();
    if (savedPlayerStates.length === 0) return;
    console.log(`${formatLogTimestamp()} [INFO] Attempting restoration of ${savedPlayerStates.length} saved player state(s).`);

    for (const savedState of savedPlayerStates) {
        try {
            if (!savedState.guildId || !savedState.messageId) {
                await deletePlayerState(savedState.guildId);
                continue;
            }

            if ((!savedState.currentTrack && savedState.queue.length === 0) || !savedState.voiceChannelId || !savedState.textChannelId) {
                await deletePlayerState(savedState.guildId);
                await deleteOldMessage(client, savedState.textChannelId, savedState.messageId);
                continue;
            }

            const existingPlayer = client.music.players.get(savedState.guildId);
            if (!existingPlayer) {
                const player = client.music.players.create({
                    guildId: savedState.guildId,
                    voiceChannelId: savedState.voiceChannelId,
                    textChannelId: savedState.textChannelId,
                    volume: savedState.volume,
                    autoLeave: true,
                });

                await player.connect({ selfDeaf: true });

                if (savedState.currentTrack) {
                    if (!savedState.currentTrack.requestedBy) {
                        savedState.currentTrack.requestedBy = client.user ?? undefined;
                    }
                    player.queue.add(savedState.currentTrack);
                }
                if (savedState.queue.length > 0) {
                    player.queue.add(savedState.queue)
                }
                if (savedState.previous.length > 0) {
                    for (const track of savedState.previous) {
                        player.previous.push(track);
                    }
                }

                player.setVolume(savedState.volume);
                player.setLoop(savedState.loop as any);
                player.setAutoPlay(savedState.autoPlay);

                await deleteOldMessage(client, savedState.textChannelId, savedState.messageId);

                if (player.queue.size > 0) {
                    player.data.isRestored = true;
                    player.data.wasPaused = savedState.paused;
                    await player.play({ position: savedState.position });
                }
            }

            const textChannel = await client.channels.fetch(savedState.textChannelId) as TextChannel;
            if (textChannel) {
                const embed = new EmbedBuilder()
                    .setAuthor({ name: "Player Resuming", iconURL: textChannel.guild.iconURL() || undefined })
                    .setColor("#0EFEFE")
                    .setDescription("🎶 The player is resuming from its last saved state.")

                const sentMessage = await sendMessage(textChannel, { embeds: [embed] });
                if (sentMessage) {
                    deleteMessage(sentMessage, { timeout: 30000 });
                }
            }

            await deletePlayerState(savedState.guildId);
        } catch (error) {
            logError(error, `Failed to restore player for guild ${savedState.guildId}`);
            await deletePlayerState(savedState.guildId);
        }
    }
}

async function deleteOldMessage(client: Client, textChannelId: string, messageId: string) {
    const textChannel = await client.channels.fetch(textChannelId) as TextChannel;
    if (textChannel) {
        const oldMessage = await textChannel.messages.fetch(messageId).catch(() => null);
        if (oldMessage) {
            deleteMessage(oldMessage, { timeout: 0 });
        }
    }
}