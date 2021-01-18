const humanizeDuration = require("humanize-duration");
const { del } = require("../../functions.js");

module.exports = async (client, player, track) => {
    const channel = client.channels.cache.get(player.textChannel);
    channel.send(`Now playing: **${track.title}** \`${humanizeDuration(track.duration)}\``).then(m => del(m, 30000));
}