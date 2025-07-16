import {
    EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, Client, Message,
    TextChannel, ComponentType, ButtonInteraction, InteractionCollector
} from "discord.js";
import { Player, Track } from "moonlink.js";
import humanizeDuration from "humanize-duration";
import { sendMessage, deleteMessage, editMessage } from "../../utils/messageUtils";
import { formatSongTitle } from "../../utils/stringUtils";
import { deferUpdate } from "../../utils/replyUtils";
import { savePlayerState } from "../../utils/dbUtils";

const TIMELINE_UPDATE_INTERVAL = 5000;
const DEFAULT_TIMELINE_LENGTH = 25;
const SHORT_TIMELINE_LENGTH = 20;

export default {
    name: "trackStart",
    execute: async (client: Client, player: Player, track: Track) => {
        const guild = await client.guilds.fetch(player.guildId);
        const channel = await client.channels.fetch(player.textChannelId) as TextChannel;
        const requestedBy = track.requestedBy && typeof track.requestedBy === 'object' && 'id' in track.requestedBy ? String(track.requestedBy.id) : undefined;
        const requester = requestedBy ? await client.users.fetch(requestedBy).catch(() => client.user) : client.user;
        const footerText = `Requested by ${requester?.tag || "Unknown"}`;
        const timelineLength = footerText.length > 30 ? SHORT_TIMELINE_LENGTH : DEFAULT_TIMELINE_LENGTH;
        const formattedTitle = formatSongTitle(track.title || "", track.author || "", track.url || "");

        const embed = new EmbedBuilder()
            .setAuthor({ name: "Now Playing!", iconURL: guild.iconURL() || undefined })
            .setThumbnail(track.getThumbnailUrl() ?? guild.iconURL() ?? null)
            .setColor("#0EFEFE")
            .setDescription(`▶️ ${formattedTitle} \`${humanizeDuration(Math.round((track.duration || 0) / 1000) * 1000)}\`\n🔘${'▬'.repeat(timelineLength)}\n\`0 Seconds\``)
            .setFooter({ text: footerText, iconURL: requester?.displayAvatarURL() || undefined });

        clearPlayerIntervalsAndCollectors(player);
        const sentMessage = await sendMessage(channel, { embeds: [embed.toJSON()] });
        if (sentMessage) {
            player.data.message = sentMessage;
            updateTimeline(sentMessage, embed, player, track, timelineLength);
            controls(sentMessage, embed, player, track);
            await savePlayerState(player);
        }
    },
};

function updateTimeline(message: Message, embed: EmbedBuilder, player: Player, track: Track, timelineLength: number) {
    player.data.timelineInterval = setInterval(async () => {
        if (!player || !player.current || !player.data.message) {
            clearPlayerIntervalsAndCollectors(player);
            return;
        }

        const currentPosition = Math.floor((player.current.position || 0) / 1000);
        const totalLength = Math.floor((track.duration || 0) / 1000);
        const markerPosition = Math.round((currentPosition / totalLength) * timelineLength);

        const timelineArray = '▬'.repeat(timelineLength + 1).split('');
        timelineArray[markerPosition] = '🔘';

        const formattedTitle = formatSongTitle(track.title || "", track.author || "", track.url || "");

        embed.setDescription(`▶️ ${formattedTitle} \`${humanizeDuration(Math.round((track.duration || 0) / 1000) * 1000)}\`\n${timelineArray.join('')}\n\`${humanizeDuration(Math.round((player.current.position || 0) / 1000) * 1000)}\``);

        try {
            await editMessage(message, { embeds: [embed.toJSON()] });
            await savePlayerState(player);
        } catch (error: unknown) {
            clearPlayerIntervalsAndCollectors(player);
            return;
        }
    }, TIMELINE_UPDATE_INTERVAL);
}

function createButton(customId: string, label: string, style: ButtonStyle): ButtonBuilder {
    return new ButtonBuilder().setCustomId(customId).setLabel(label).setStyle(style);
}

function createControlRows(): ActionRowBuilder<ButtonBuilder>[] {
    const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
        createButton("🔈", "🔈", ButtonStyle.Primary),
        createButton("⏯", "⏯", ButtonStyle.Secondary),
        createButton("⏮", "⏮", ButtonStyle.Secondary),
        createButton("⏭", "⏭", ButtonStyle.Secondary)
    );
    const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
        createButton("🔀", "🔀", ButtonStyle.Secondary),
        createButton("🔁", "🔁", ButtonStyle.Secondary),
        createButton("🔂", "🔂", ButtonStyle.Secondary),
        createButton("⏹", "⏹", ButtonStyle.Danger)
    );
    return [row1, row2];
}

async function createControlCollector(message: Message, embed: EmbedBuilder, player: Player) {
    if (!message || !message.id) return;
    const rows = createControlRows();
    await editMessage(message, { components: rows.map(row => row.toJSON()) });

    const filter = (i: any) => {
        const voiceChannel = i.member?.voice.channel;
        return ["🔈", "⏯", "⏮", "⏭", "🔀", "🔁", "🔂", "⏹"]
            .includes(i.customId) && voiceChannel && voiceChannel.id === player.voiceChannelId;
    };
    return message.createMessageComponentCollector({ filter, componentType: ComponentType.Button });
}

async function controls(message: Message, embed: EmbedBuilder, player: Player, track: Track) {
    if (player.data.controlCollector && typeof (player.data.controlCollector as any).stop === "function") {
        (player.data.controlCollector as InteractionCollector<ButtonInteraction>).stop();
        player.data.controlCollector = null;
    }

    const collector = await createControlCollector(message, embed, player);
    if (!collector) return;

    player.data.controlCollector = collector;

    collector.on("collect", async (interaction: ButtonInteraction) => {
        await deferUpdate(interaction);
        const reacted = interaction.customId;
        switch (reacted) {
            case "🔈":
                handleVolume(message, embed, player, track);
                break;
            case "⏯":
                handlePlayPause(message, embed, player);
                break;
            case "⏮":
                handlePrevious(message, player, track);
                break;
            case "⏭":
                handleNext(message, player);
                break;
            case "🔀":
                handleShuffle(message, embed, player);
                break;
            case "🔁":
                handleQueueRepeat(message, embed, player);
                break;
            case "🔂":
                handleTrackRepeat(message, embed, player);
                break;
            case "⏹":
                handleStop(message, player);
                break;
        }
    });
}

function createVolumeRow(): ActionRowBuilder<ButtonBuilder>[] {
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        createButton("🔉", "🔉", ButtonStyle.Secondary),
        createButton("🔊", "🔊", ButtonStyle.Secondary),
        createButton("📈", "📈", ButtonStyle.Danger),
        createButton("🎵", "🎵", ButtonStyle.Primary)
    );
    return [row];
}

async function createVolumeCollector(message: Message, embed: EmbedBuilder, player: Player) {
    if (!message || !message.id) return;
    const rows = createVolumeRow();
    await editMessage(message, { components: rows.map(row => row.toJSON()) });

    const filter = (i: any) => {
        const voiceChannel = i.member?.voice.channel;
        return ["🔉", "🔊", "📈", "🎵"]
            .includes(i.customId) && voiceChannel && voiceChannel.id === player.voiceChannelId;
    };
    return message.createMessageComponentCollector({ filter, componentType: ComponentType.Button });
}

async function volumeControls(message: Message, embed: EmbedBuilder, player: Player, track: Track) {
    if (
        player.data.volumeCollector &&
        typeof (player.data.volumeCollector as InteractionCollector<ButtonInteraction>).stop === "function"
    ) {
        (player.data.volumeCollector as InteractionCollector<ButtonInteraction>).stop();
        player.data.volumeCollector = null;
    }
    const collector = await createVolumeCollector(message, embed, player);
    if (!collector) return;

    player.data.volumeCollector = collector;

    collector.on("collect", async (interaction: ButtonInteraction) => {
        await deferUpdate(interaction);
        const reacted = interaction.customId;
        switch (reacted) {
            case "🔉":
                handleVolumeDown(message, embed, player);
                break;
            case "🔊":
                handleVolumeUp(message, embed, player);
                break;
            case "📈":
                handleBassBoost(message, embed, player);
                break;
            case "🎵":
                handleMusic(message, embed, player, track);
                break;
        }
    });
}

function clearPlayerIntervalsAndCollectors(player: Player) {
    if (player.data.timelineInterval) {
        clearInterval(player.data.timelineInterval as NodeJS.Timeout);
        player.data.timelineInterval = null;
    }
    if (player.data.controlCollector && typeof (player.data.controlCollector as InteractionCollector<ButtonInteraction>).stop === "function") {
        (player.data.controlCollector as InteractionCollector<ButtonInteraction>).stop();
        player.data.controlCollector = null;
    }
    if (player.data.volumeCollector && typeof (player.data.volumeCollector as InteractionCollector<ButtonInteraction>).stop === "function") {
        (player.data.volumeCollector as InteractionCollector<ButtonInteraction>).stop();
        player.data.volumeCollector = null;
    }
    player.data.message = null;
}

async function handleVolume(message: Message, embed: EmbedBuilder, player: Player, track: Track) {
    if (player.data.controlCollector && typeof (player.data.controlCollector as InteractionCollector<ButtonInteraction>).stop === "function") {
        (player.data.controlCollector as InteractionCollector<ButtonInteraction>).stop();
        player.data.controlCollector = null;
    }

    const rows = createVolumeRow();
    await editMessage(message, { components: rows.map(row => row.toJSON()) });
    await editFields(message, embed, player);
    await volumeControls(message, embed, player, track);
}

async function handlePlayPause(message: Message, embed: EmbedBuilder, player: Player) {
    if (player && !player.paused) player.pause();
    else if (player && player.paused) player.resume();
    await editFields(message, embed, player, `Player ${!player.paused ? "Resumed" : "Paused"}`,
        `⏯ The player has successfully ${!player.paused ? "**resumed**" : "**paused**."}`);
}

async function handlePrevious(message: Message, player: Player, track: Track) {
    await deleteMessage(message, { timeout: 0 });
    clearPlayerIntervalsAndCollectors(player);

    if (player && Array.isArray(player.previous) && player.previous.length > 0) {
        player.back();
    } else if (player && player.current) {
        player.replay();
    }
}

async function handleNext(message: Message, player: Player) {
    await deleteMessage(message, { timeout: 0 });
    clearPlayerIntervalsAndCollectors(player);
    if (!player.queue.size) player.stop();
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
    clearPlayerIntervalsAndCollectors(player);
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

async function handleMusic(message: Message, embed: EmbedBuilder, player: Player, track: Track) {
    if (player.data.volumeCollector && typeof (player.data.volumeCollector as InteractionCollector<ButtonInteraction>).stop === "function") {
        (player.data.volumeCollector as InteractionCollector<ButtonInteraction>).stop();
        player.data.volumeCollector = null;
    }
    const rows = createControlRows();
    await editMessage(message, { components: rows.map(row => row.toJSON()) });
    await editFields(message, embed);
    await controls(message, embed, player, track);
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
    await editMessage(message, { embeds: [embed.toJSON()] });
}