const { s, e, del, simplePrompt } = require("../../functions.js");
const humanizeDuration = require("humanize-duration");
const { MessageEmbed } = require("discord.js");

module.exports = async (client, player, track) => {
    const channel = await client.channels.fetch(player.textChannel);
    const embed = new MessageEmbed()
        .setAuthor({ name: "Now Playing!", iconURL: track.requester.displayAvatarURL() })
        .setThumbnail(track.thumbnail)
        .setDescription(`▶️ Now playing: **${track.title}** \`${humanizeDuration(track.duration)}\` by ${track.author}`)

    return s(channel, '', embed).then(async m => {
        if (player.options.message) del(player.options.message, 0);
        else player.options.message = m;
        del(m, track.duration);
        controls(client, m, embed, player, track);
    });
}

async function controls(client, message, embed, player, track) {
    message.reactions.removeAll().then(async () => {
        const reacted = await simplePrompt(message, ["🔈", "⏯", "⏮", "⏭", "🔀", "🔁", "🔂", "⏹"])
            .catch(() => { return message ? controls(client, message, embed, player, track) : undefined });
        if (reacted == "🔈") {
            editFields(message, embed, player);
            return volumeControls(client, message, embed, player, track);
        } else if (reacted == "⏯") {
            if (player && player.playing) player.pause(true);
            else if (player && !player.playing) player.pause(false);
            editFields(message, embed, player, `Player ${player.playing ? "Resumed" : "Paused"}`,
                `⏯ The player has successfully ${player.playing ? "**resumed**" : "**paused**."}`)
            controls(client, message, embed, player, track);
        } else if (reacted == "⏮") {
            del(message, 0);
            if (player && player.queue.previous) return player.play(player.queue.previous);
            else if (player && !player.queue.previous) return player.play(track);
        } else if (reacted == "⏭") {
            del(message, 0);
            if (player) return player.stop();
        } else if (reacted == "🔀") {
            if (player) player.queue.shuffle();
            editFields(message, embed, player, "Queue Shuffled: ",
                "🔀 The song queue has been shuffled randomly!")
            return controls(client, message, embed, player, track);
        } else if (reacted == "🔁") {
            if (player.queueRepeat) player.setQueueRepeat(false);
            else player.setQueueRepeat(true);
            editFields(message, embed, player, `Queue Repeat ${player.queueRepeat ? "On" : "Off"}`,
                `🔁 Queue repeat was successfully turned ${player.queueRepeat ? "**on**" : "**off**."}`)
            return controls(client, message, embed, player, track);
        } else if (reacted == "🔂") {
            if (player.trackRepeat) player.setTrackRepeat(false);
            else player.setTrackRepeat(true);
            editFields(message, embed, player, `Track Repeat ${player.trackRepeat ? "On" : "Off"}`,
                `🔁 Track repeat was successfully turned ${player.trackRepeat ? "**on**" : "**off**."}`)
            return controls(client, message, embed, player, track);
        } else if (reacted == "⏹") {
            del(message, 0);
            if (player) player.destroy();
            embed = new MessageEmbed()
                .setAuthor({ name: "Music Player Disconnected!", iconURL: message.author.displayAvatarURL() })
                .setDescription("🛑 The music player has successfully been disconnected!");
            return s(message.channel, '', embed).then(m => del(m, 15000));
        } else return;
    }).catch(err => err);
}

async function volumeControls(client, message, embed, player, track) {
    message.reactions.removeAll().then(async () => {
        const reacted = await simplePrompt(message, ["🔉", "🔊", "🎵"])
            .catch(() => { return message ? volumeControls(client, message, embed, player, track) : undefined });
        if (reacted == "🔉") {
            if (player && player.volume >= 5) player.setVolume(player.volume - 5);
            editFields(message, embed, player);
            return volumeControls(client, message, embed, player, track);
        } else if (reacted == "🔊") {
            if (player && player.volume <= 95) player.setVolume(player.volume + 5);
            editFields(message, embed, player);
            return volumeControls(client, message, embed, player, track);
        } else if (reacted == "🎵") {
            editFields(message, embed)
            return controls(client, message, embed, player, track);
        } else return;
    }).catch(err => err);
}

function editFields(message, embed, player, title, text) {
    embed.fields = [];
    if (player && !title) {
        const vol = player.volume / 10, volFloor = Math.floor(player.volume / 10);
        const volLevel = vol > volFloor ? `${"🔊".repeat(volFloor)} 🔉 ${"🔈".repeat(10 - vol)}`
            : `${"🔊".repeat(volFloor)} ${"🔈".repeat(10 - vol)}`;
        embed.addField("Volume Level: ", `**${player.volume}%** ${volLevel}`);
        return e(message, message.channel, '', embed);
    } else if (title) return e(message, message.channel, '', embed.addField(title, text));
    else return e(message, message.channel, '', embed);
}