import { Client, EmbedBuilder, TextChannel } from "discord.js";
import { Node } from "moonlink.js";
import { getAllSavedPlayerStates, deletePlayerState } from "../../utils/dbUtils";
import { sendMessage, deleteMessage } from "../../utils/messageUtils";

export default {
    name: "nodeConnected",
    execute: async (client: Client, node: Node) => {
        console.log(`Successfully connected to Lavalink.`);

        const savedPlayerStates = await getAllSavedPlayerStates();
        if (savedPlayerStates.length === 0) return;

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

                const player = client.music.createPlayer({
                    guildId: savedState.guildId,
                    voiceChannelId: savedState.voiceChannelId,
                    textChannelId: savedState.textChannelId,
                    volume: savedState.volume,
                    autoLeave: true,
                });

                player.connect({ setDeaf: true, setMute: false });

                if (savedState.currentTrack) {
                    player.queue.add(savedState.currentTrack);
                }
                if (savedState.queue.length > 0) {
                    for (const track of savedState.queue) {
                        player.queue.add(track);
                    }
                }
                if (savedState.previous.length > 0) {
                    for (const track of savedState.previous) {
                        player.previous.push(track);
                    }
                }

                player.setLoop(savedState.loop as any);
                player.setVolume(savedState.volume);

                if (savedState.playing) {
                    player.play({
                        position: savedState.position,
                    });
                    if (savedState.paused) {
                        player.pause();
                    }
                }

                setTimeout(() => {
                    if (player && !player.current) {
                        player.disconnect();
                        player.destroy();
                    }
                }, 5000);

                const textChannel = await client.channels.fetch(savedState.textChannelId) as TextChannel;
                if (textChannel) {
                    await deleteOldMessage(client, savedState.textChannelId, savedState.messageId);

                    const embed = new EmbedBuilder()
                        .setAuthor({ name: "Player Resuming", iconURL: textChannel.guild.iconURL() || undefined })
                        .setThumbnail(player.current.getThumbnailUrl() ?? textChannel.guild.iconURL() ?? null)
                        .setColor("#0EFEFE")
                        .setDescription("🎶 The player is resuming from its last saved state.")

                    const sentMessage = await sendMessage(textChannel, { embeds: [embed.toJSON()] });
                    if (sentMessage) {
                        deleteMessage(sentMessage, { timeout: 30000 });
                    }
                }

                await deletePlayerState(savedState.guildId);
            } catch (error) {
                console.error(`Failed to restore player for guild ${savedState.guildId}:`, error);
                await deletePlayerState(savedState.guildId);
            }
        }
    },
};

async function deleteOldMessage(client: Client, textChannelId: string, messageId: string) {
    const textChannel = await client.channels.fetch(textChannelId) as TextChannel;
    if (textChannel) {
        const oldMessage = await textChannel.messages.fetch(messageId).catch(() => null);
        if (oldMessage) {
            deleteMessage(oldMessage, { timeout: 0 });
        }
    }
}