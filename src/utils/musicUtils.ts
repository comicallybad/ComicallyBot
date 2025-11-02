
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, EmbedBuilder, Message } from "discord.js";
import { Player } from "moonlink.js";
import { deleteMessage, editMessage } from "./messageUtils";
import { deferUpdate } from "./replyUtils";

function createButton(customId: string, label: string, style: ButtonStyle): ButtonBuilder {
    return new ButtonBuilder().setCustomId(customId).setLabel(label).setStyle(style);
}

export function createControlRows(): ActionRowBuilder<ButtonBuilder>[] {
    const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
        createButton("music-volume", "🔈", ButtonStyle.Primary),
        createButton("music-playpause", "⏯", ButtonStyle.Secondary),
        createButton("music-previous", "⏮", ButtonStyle.Secondary),
        createButton("music-next", "⏭", ButtonStyle.Secondary)
    );
    const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
        createButton("music-shuffle", "🔀", ButtonStyle.Secondary),
        createButton("music-queuerepeat", "🔁", ButtonStyle.Secondary),
        createButton("music-trackrepeat", "🔂", ButtonStyle.Secondary),
        createButton("music-stop", "⏹", ButtonStyle.Danger)
    );
    return [row1, row2];
}

function createVolumeRow(): ActionRowBuilder<ButtonBuilder>[] {
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        createButton("music-volumedown", "🔉", ButtonStyle.Secondary),
        createButton("music-volumeup", "🔊", ButtonStyle.Secondary),
        createButton("music-bassboost", "📈", ButtonStyle.Danger),
        createButton("music-music", "🎵", ButtonStyle.Primary)
    );
    return [row];
}

export async function handleMusicInteraction(interaction: ButtonInteraction, client: any) {
    await deferUpdate(interaction);

    const player = client.music.players.get(interaction.guildId);

    if (!player || (player.data.message && interaction.message.id !== (player.data.message as Message).id)) {
        return deleteMessage(interaction.message);
    }

    const voiceChannel = (interaction.member as any).voice.channel;
    if (!voiceChannel || voiceChannel.id !== player.voiceChannelId) {
        return;
    }

    const message = interaction.message;
    const embed = new EmbedBuilder(message.embeds[0].toJSON());

    switch (interaction.customId) {
        case "music-volume":
            await handleVolume(message, embed, player);
            break;
        case "music-playpause":
            await handlePlayPause(message, embed, player);
            break;
        case "music-previous":
            await handlePrevious(message, player);
            break;
        case "music-next":
            await handleNext(message, player);
            break;
        case "music-shuffle":
            await handleShuffle(message, embed, player);
            break;
        case "music-queuerepeat":
            await handleQueueRepeat(message, embed, player);
            break;
        case "music-trackrepeat":
            await handleTrackRepeat(message, embed, player);
            break;
        case "music-stop":
            await handleStop(message, player);
            break;
        case "music-volumedown":
            await handleVolumeDown(message, embed, player);
            break;
        case "music-volumeup":
            await handleVolumeUp(message, embed, player);
            break;
        case "music-bassboost":
            await handleBassBoost(message, embed, player);
            break;
        case "music-music":
            await handleMusic(message, embed, player);
            break;
    }
}

async function handleVolume(message: Message, embed: EmbedBuilder, player: Player) {
    const rows = createVolumeRow();
    await editMessage(message, { components: rows });
    await editFields(message, embed, player);
}

async function handlePlayPause(message: Message, embed: EmbedBuilder, player: Player) {
    if (player && !player.paused) player.pause();
    else if (player && player.paused) player.resume();
    await editFields(message, embed, player, `Player ${!player.paused ? "Resumed" : "Paused"}`,
        `⏯ The player has successfully ${!player.paused ? "**resumed**" : "**paused**."}`);
}

async function handlePrevious(message: Message, player: Player) {
    await deleteMessage(message, { timeout: 0 });
    clearPlayerInterval(player);

    if (player && Array.isArray(player.previous) && player.previous.length > 0) {
        player.back();
    } else if (player && player.current) {
        player.replay();
    }
}

async function handleNext(message: Message, player: Player) {
    await deleteMessage(message, { timeout: 0 });
    clearPlayerInterval(player);
    if (player.queue.size === 0) player.destroy();
    else player.skip();
}

async function handleShuffle(message: Message, embed: EmbedBuilder, player: Player) {
    if (player) player.shuffle();
    await editFields(message, embed, player, "Queue Shuffled: ",
        "🔀 The song queue has been shuffled randomly!");
}

async function handleQueueRepeat(message: Message, embed: EmbedBuilder, player: Player) {
    if (player.loop !== "off" && player.loop !== "track") player.setLoop("off");
    else player.setLoop("queue");
    await editFields(message, embed, player, `Queue Repeat ${player.loop !== "off" ? "On" : "Off"}`,
        `🔁 Queue repeat was successfully turned ${player.loop !== "off" ? "**on**" : "**off**."}`);
}

async function handleTrackRepeat(message: Message, embed: EmbedBuilder, player: Player) {
    if (player.loop !== "off" && player.loop !== "queue") player.setLoop("off");
    else player.setLoop("track");
    await editFields(message, embed, player, `Track Repeat ${player.loop !== "off" ? "On" : "Off"}`,
        `🔁 Track repeat was successfully turned ${player.loop !== "off" ? "**on**" : "**off**."}`);
}

async function handleStop(message: Message, player: Player) {
    await deleteMessage(message, { timeout: 0 });
    clearPlayerInterval(player);
    if (player) player.destroy();
}

async function handleVolumeUp(message: Message, embed: EmbedBuilder, player: Player) {
    if (player && player.volume <= 95) player.setVolume(player.volume + 5);
    await editFields(message, embed, player);
}

async function handleVolumeDown(message: Message, embed: EmbedBuilder, player: Player) {
    if (player && player.volume >= 5) player.setVolume(player.volume - 5);
    await editFields(message, embed, player);
}

async function handleBassBoost(message: Message, embed: EmbedBuilder, player: Player) {
    if (!player) return;
    const equalizerFilter = (player.filters as any).filters.equalizer;
    const isBassBoostActive = equalizerFilter && equalizerFilter.length > 0 && equalizerFilter.some((band: any) => band.gain > 0);

    if (isBassBoostActive) {
        player.filters.resetFilters();
    } else {
        player.filters.setEqualizer([
            { band: 0, gain: 0.15 },
            { band: 1, gain: 0.2 },
            { band: 2, gain: 0.2 },
            { band: 3, gain: 0 },
            { band: 4, gain: -0.1 },
            { band: 5, gain: 0.05 }
        ]);
    }
    await editFields(message, embed, player, `Bass Boost ${!isBassBoostActive ? "On" : "Off"}`,
        `📈 Bass Boost was successfully turned  ${!isBassBoostActive ? "**on**" : "**off**."}`);
}

async function handleMusic(message: Message, embed: EmbedBuilder, player: Player) {
    const rows = createControlRows();
    await editMessage(message, { components: rows });
    await editFields(message, embed);
}

async function editFields(message: Message, embed: EmbedBuilder, player?: Player, title?: string, text?: string) {
    embed.setFields([]);

    if (player) {
        if (!title) {
            const vol = player.volume / 10;
            const volFloor = Math.floor(player.volume / 10);
            const volLevel = `🔊`.repeat(volFloor) + (vol > volFloor ? ` 🔉 ` : ``) + `🔈`.repeat(10 - Math.ceil(vol));
            embed.addFields([{ name: "Volume Level: ", value: `**${player.volume}%** ${volLevel}` }]);
        } else if (text) {
            embed.addFields([{ name: title, value: text }]);
        }
    }
    await editMessage(message, { embeds: [embed] });
}

export function clearPlayerInterval(player: Player) {
    if (player.data.timelineInterval) {
        clearInterval(player.data.timelineInterval as NodeJS.Timeout);
        player.data.timelineInterval = null;
    }
    if (player.data.message) {
        deleteMessage(player.data.message as Message, { timeout: 0 });
    }
    player.data.message = null;
    return;
}
