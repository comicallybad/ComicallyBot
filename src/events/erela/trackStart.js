const { s, e, del } = require("../../../utils/functions/functions.js");
const humanizeDuration = require("humanize-duration");
const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");

module.exports = async (client, player, track) => {
    const channel = await client.channels.fetch(player.textChannel);
    const guild = await client.guilds.fetch(player.guild);
    const embed = new EmbedBuilder()
        .setAuthor({ name: "Now Playing!", iconURL: guild.iconURL() })
        .setThumbnail(track.thumbnail ? track.thumbnail : guild.iconURL())
        .setDescription(`▶️ [**${track.title.includes(track.author) ? track.title : `${track.title} by ${track.author}`}**](${track.uri}) \`${humanizeDuration(track.duration)}\``)
        .setFooter({ text: `Requested by ${track.requester.tag}`, iconURL: track.requester.displayAvatarURL() });

    return s(channel, '', embed).then(m => {
        if (player.options.message) del(player.options.message, 0);
        else player.options.message = m;
        del(m, track.duration);
        return controls(m, embed, player, track);
    });
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

function createControlCollector(message) {
    const rows = createControlRows();
    const filter = i => ["🔈", "⏯", "⏮", "⏭", "🔀", "🔁", "🔂", "⏹"].includes(i.customId);
    message.edit({ components: rows });
    return message.createMessageComponentCollector({ filter });
}

function controls(message, embed, player, track) {
    const collector = createControlCollector(message);
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
        else if (reacted == "⏹") return handleStop(message, embed, player, collector);
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

function createVolumeCollector(message) {
    const row = createVolumeRow();
    const filter = i => ["🔉", "🔊", "🎵", "📈"].includes(i.customId);
    message.edit({ components: [row] });
    return message.createMessageComponentCollector({ filter });
}

function volumeControls(message, embed, player, track) {
    const collector = createVolumeCollector(message);
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
    message.edit({ components: [] });
    editFields(message, embed, player);
    return volumeControls(message, embed, player, track);
}

function handlePlayPause(message, embed, player) {
    if (player && player.playing) player.pause(true);
    else if (player && !player.playing) player.pause(false);
    return editFields(message, embed, player, `Player ${player.playing ? "Resumed" : "Paused"}`,
        `⏯ The player has successfully ${player.playing ? "**resumed**" : "**paused**."}`)
}

function handlePrevious(message, player, track, collector) {
    collector.stop();
    del(message, 0);
    if (player && player.queue.previous) return player.play(player.queue.previous);
    else if (player && !player.queue.previous) return player.play(track);
}

function handleNext(message, player, collector) {
    collector.stop();
    del(message, 0);
    if (player) return player.stop();
}

function handleShuffle(message, embed, player) {
    if (player) player.queue.shuffle();
    return editFields(message, embed, player, "Queue Shuffled: ",
        "🔀 The song queue has been shuffled randomly!")
}

function handleQueueRepeat(message, embed, player) {
    if (player.queueRepeat) player.setQueueRepeat(false);
    else player.setQueueRepeat(true);
    return editFields(message, embed, player, `Queue Repeat ${player.queueRepeat ? "On" : "Off"}`,
        `🔁 Queue repeat was successfully turned ${player.queueRepeat ? "**on**" : "**off**."}`)
}

function handleTrackRepeat(message, embed, player) {
    if (player.trackRepeat) player.setTrackRepeat(false);
    else player.setTrackRepeat(true);
    return editFields(message, embed, player, `Track Repeat ${player.trackRepeat ? "On" : "Off"}`,
        `🔁 Track repeat was successfully turned ${player.trackRepeat ? "**on**" : "**off**."}`)
}

function handleStop(message, embed, player, collector) {
    collector.stop();
    del(message, 0);
    if (player) player.destroy();
    embed = new EmbedBuilder()
        .setAuthor({ name: "Music Player Disconnected!", iconURL: message.author.displayAvatarURL() })
        .setDescription("🛑 The music player has successfully been disconnected!");
    return s(message.channel, '', embed).then(m => del(m, 15000));
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
    const bassBoostedBands = [0.6, 0.67, 0.67, 0, -0.5, 0.15, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const bool = JSON.stringify(player.bands) === JSON.stringify(bassBoostedBands);
    if (!player) return;
    player.clearEQ();
    if (!bool) {
        await new Promise(resolve => setTimeout(resolve, 500));
        player.setEQ([
            { band: 0, gain: 0.6 },
            { band: 1, gain: 0.67 },
            { band: 2, gain: 0.67 },
            { band: 3, gain: 0 },
            { band: 4, gain: -0.5 },
            { band: 5, gain: 0.15 }
        ]);
    }
    return editFields(message, embed, player, `Bass Boost ${!bool ? "On" : "Off"}`,
        `📈 Bass Boost was successfully turned  ${!bool ? "**on**" : "**off**."}`)
}

function handleMusic(message, embed, player, track, collector) {
    collector.stop();
    message.edit({ components: [] });
    editFields(message, embed)
    return controls(message, embed, player, track);
}

function editFields(message, embed, player, title, text) {
    if (player && !title) {
        const vol = player.volume / 10, volFloor = Math.floor(player.volume / 10);
        const volLevel = vol > volFloor ? `${"🔊".repeat(volFloor)} 🔉 ${"🔈".repeat(10 - vol)}`
            : `${"🔊".repeat(volFloor)} ${"🔈".repeat(10 - vol)}`;
        embed.setFields({ name: "Volume Level: ", value: `**${player.volume}%** ${volLevel}` });
        return message.edit({ embeds: [embed] });
    } else if (title) return message.edit({ embeds: [embed.setFields({ name: `${title}`, value: `${text}` })] });
    else return message.edit({ embeds: [embed] })
}