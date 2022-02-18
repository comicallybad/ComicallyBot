const humanizeDuration = require("humanize-duration");
const { s, del } = require("../../functions.js");

module.exports = async (client, player, track) => {
    const channel = await client.channels.fetch(player.textChannel);
    return s(channel, `Now playing: **${track.title}** \`${humanizeDuration(track.duration)}\``).then(m => del(m, 30000));
}