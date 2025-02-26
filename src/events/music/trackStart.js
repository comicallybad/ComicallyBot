const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");
const { s, del } = require("../../../utils/functions/functions.js");
const humanizeDuration = require("humanize-duration");

module.exports = async (client, player, track) => {
    const guild = await client.guilds.fetch(player.guildId);
    const channel = await client.channels.fetch(player.textChannelId);
    const requestedBy = track.requestedBy.id || client.user.id;
    const requester = await client.users.fetch(requestedBy).catch(() => client.user);
    const footerText = `Requested by ${requester.tag}`;
    const timelineLength = footerText.length > 30 ? 20 : 25;

    const embed = new EmbedBuilder()
        .setAuthor({ name: "Now Playing!", iconURL: guild.iconURL() })
        .setThumbnail(track.thumbnail ? track.thumbnail : guild.iconURL())
        .setColor("#0EFEFE")
        .setDescription(`▶️ [**${track.title.includes(track.author) ? track.title : `${track.title} by ${track.author}`}**](${track.url}) \`${humanizeDuration(Math.round(track.duration / 1000) * 1000)}\`\n🔘${'▬'.repeat(timelineLength)}\n\`0 Seconds\``)
        .setFooter({ text: footerText, iconURL: requester.displayAvatarURL() });

    return s(channel, '', embed).then(m => {
        player.data.message = m;
        updateTimeline(m, embed, player, track, timelineLength);
        return controls(m, embed, player, track);
    });
}

function updateTimeline(message, embed, player, track, timelineLength) {
    const interval = setInterval(async () => {
        if (!player || !player.current) return clearInterval(interval);
        const currentPosition = Math.floor(player.current.position / 1000);
        const totalLength = Math.floor(track.duration / 1000);
        const markerPosition = Math.round((currentPosition / totalLength) * timelineLength);

        let timeline = '▬'.repeat(timelineLength + 1).split('');
        timeline[markerPosition] = '🔘';
        timeline = timeline.join('');

        embed.setDescription(`▶️ [**${track.title.includes(track.author) ? track.title : `${track.title} by ${track.author}`}**](${track.url}) \`${humanizeDuration(Math.round(track.duration / 1000) * 1000)}\`\n${timeline}\n\`${humanizeDuration(Math.round(player.current.position / 1000) * 1000)}\``);

        if (player.data.message) {
            try {
                await message.edit({ embeds: [embed] });
            } catch (err) {
                clearInterval(interval);
            }
        }

        if (!player.data.message)
            clearInterval(interval);
    }, 5000);
}

function createControlRows() {
    const row1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("🔈")
            .setLabel("🔈")
            .setStyle(ButtonStyle.Primary),
        ...["⏯", "⏮", "⏭"].map((x) => new ButtonBuilder()
            .setCustomId(x)
            .setLabel(x)
            .setStyle(ButtonStyle.Secondary)))
    const row2 = new ActionRowBuilder().addComponents(
        ...["🔀", "🔁", "🔂"].map((x) => new ButtonBuilder()
            .setCustomId(x)
            .setLabel(x)
            .setStyle(ButtonStyle.Secondary)),
        new ButtonBuilder()
            .setCustomId("⏹")
            .setLabel("⏹")
            .setStyle(ButtonStyle.Danger))
    return [row1, row2];
}

function createControlCollector(message, player) {
    if (!message || !message.id) return;
    const rows = createControlRows();
    const filter = i => {
        const voiceChannel = i.member.voice.channel;
        return ["🔈", "⏯", "⏮", "⏭", "🔀", "🔁", "🔂", "⏹"].includes(i.customId) &&
            voiceChannel && voiceChannel.id === player.voiceChannelId;
    };
    message.edit({ components: rows }).catch(err => err);
    return message.createMessageComponentCollector({ filter });
}

function controls(message, embed, player, track) {
    if (!message || !message.id) return;
    const collector = createControlCollector(message, player);
    collector.on("collect", (reaction) => {
        reaction.deferUpdate();
        const reacted = reaction.customId;
        if (reacted == "🔈") return handleVolume(message, embed, player, track, collector);
        else if (reacted == "⏯") return handlePlayPause(message, embed, player);
        else if (reacted == "⏮") return handlePrevious(message, player, track, collector);
        else if (reacted == "⏭") return handleNext(message, player, collector);
        else if (reacted == "🔀") return handleShuffle(message, embed, player);
        else if (reacted == "🔁") return handleQueueRepeat(message, embed, player);
        else if (reacted == "🔂") return handleTrackRepeat(message, embed, player);
        else if (reacted == "⏹") return handleStop(message, player, collector);
        else return;
    });
}

function createVolumeRow() {
    const row = new ActionRowBuilder().addComponents(
        ...["🔉", "🔊"].map((x) => new ButtonBuilder()
            .setCustomId(x)
            .setLabel(x)
            .setStyle(ButtonStyle.Secondary)),
        new ButtonBuilder()
            .setCustomId("📈")
            .setLabel("📈")
            .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
            .setCustomId("🎵")
            .setLabel("🎵")
            .setStyle(ButtonStyle.Primary))
    return row;
}

function createVolumeCollector(message, player) {
    if (!message || !message.id) return;
    const row = createVolumeRow();
    const filter = i => {
        const voiceChannel = i.member.voice.channel;
        return ["🔉", "🔊", "🎵", "📈"].includes(i.customId) &&
            voiceChannel && voiceChannel.id === player.voiceChannelId;
    };
    message.edit({ components: [row] }).catch(err => err);
    return message.createMessageComponentCollector({ filter });
}

function volumeControls(message, embed, player, track) {
    if (!message || !message.id) return;
    const collector = createVolumeCollector(message, player);
    collector.on('collect', (reaction) => {
        reaction.deferUpdate();
        const reacted = reaction.customId;
        if (reacted == "🔉") return handleVolumeUp(message, embed, player);
        else if (reacted == "🔊") return handleVolumeDown(message, embed, player);
        else if (reacted == "📈") return handleBassBoost(message, embed, player);
        else if (reacted == "🎵") return handleMusic(message, embed, player, track, collector);
        else return;
    });
}

function handleVolume(message, embed, player, track, collector) {
    collector.stop();
    message.edit({ components: [] }).catch(err => err);
    editFields(message, embed, player);
    return volumeControls(message, embed, player, track);
}

function handlePlayPause(message, embed, player) {
    if (player && !player.paused) player.pause();
    else if (player && player.paused) player.resume();
    return editFields(message, embed, player, `Player ${!player.paused ? "Resumed" : "Paused"}`,
        `⏯ The player has successfully ${!player.paused ? "**resumed**" : "**paused**."}`)
}

function handlePrevious(message, player, track, collector) {
    collector.stop();
    del(message, 0);
    if (player && player.previous) return player.play(player.previous);
    else if (player && !player.previous) return player.play(player.current)
}

function handleNext(message, player, collector) {
    collector.stop();
    del(message, 0);
    if (!player.queue.size) return player.stop();
    else return player.skip();
}

function handleShuffle(message, embed, player) {
    if (player) player.shuffle();
    return editFields(message, embed, player, "Queue Shuffled: ",
        "🔀 The song queue has been shuffled randomly!")
}

function handleQueueRepeat(message, embed, player) {
    if (player.loop !== "off" && player.loop !== "track") player.setLoop("off");
    else player.setLoop("queue");
    return editFields(message, embed, player, `Queue Repeat ${player.loop !== "off" ? "On" : "Off"}`,
        `🔁 Queue repeat was successfully turned ${player.loop !== "off" ? "**on**" : "**off**."}`);
}

function handleTrackRepeat(message, embed, player) {
    if (player.loop !== "off" && player.loop !== "queue") player.setLoop("off");
    else player.setLoop("track");
    return editFields(message, embed, player, `Track Repeat ${player.loop !== "off" ? "On" : "Off"}`,
        `🔁 Track repeat was successfully turned ${player.loop !== "off" ? "**on**" : "**off**."}`);
}

async function handleStop(message, player, collector) {
    collector.stop();
    del(message, 0);
    if (player) return player.destroy();
}

function handleVolumeUp(message, embed, player) {
    if (player && player.volume >= 5) player.setVolume(player.volume - 5);
    return editFields(message, embed, player);
}

function handleVolumeDown(message, embed, player) {
    if (player && player.volume <= 95) player.setVolume(player.volume + 5);
    return editFields(message, embed, player);
}

async function handleBassBoost(message, embed, player) {
    if (!player) return;
    const bool = player.filters.filters.equalizer;
    if (bool) player.filters.resetFilters();
    if (!bool) {
        player.filters.setEqualizer([
            { band: 0, gain: 0.25 },
            { band: 1, gain: 0.3 },
            { band: 2, gain: 0.3 },
            { band: 3, gain: 0 },
            { band: 4, gain: -0.2 },
            { band: 5, gain: 0.1 }
        ]);
    }
    return editFields(message, embed, player, `Bass Boost ${!bool ? "On" : "Off"}`,
        `📈 Bass Boost was successfully turned  ${!bool ? "**on**" : "**off**."}`)
}

function handleMusic(message, embed, player, track, collector) {
    collector.stop();
    message.edit({ components: [] }).catch(err => err);
    editFields(message, embed)
    return controls(message, embed, player, track);
}

function editFields(message, embed, player, title, text) {
    if (player && !title) {
        const vol = player.volume / 10, volFloor = Math.floor(player.volume / 10);
        const volLevel = vol > volFloor ? `${"🔊".repeat(volFloor)} 🔉 ${"🔈".repeat(10 - vol)}`
            : `${"🔊".repeat(volFloor)} ${"🔈".repeat(10 - vol)}`;
        embed.setFields({ name: "Volume Level: ", value: `**${player.volume}%** ${volLevel}` });
        return message.edit({ embeds: [embed] }).catch(err => err);
    } else if (title) return message.edit({ embeds: [embed.setFields({ name: `${title}`, value: `${text}` })] }).catch(err => err);
    else return message.edit({ embeds: [embed] }).catch(err => err);
}