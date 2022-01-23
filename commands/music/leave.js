const { r, del } = require("../../functions.js");

module.exports = {
    name: "leave",
    aliases: ["quit", "stop", "disconnect"],
    category: "music",
    description: "Disconnects the bot from the voice channel.",
    permissions: "member",
    run: (client, message, args) => {
        const voiceChannel = message.member.voice.channel;
        const player = client.music.players.get(message.guild.id);

        if (!player) return r(message.channel, message.author, "No song/s currently playing in this guild.").then(m => del(m, 7500));

        if (!player.voiceChannel) {
            player.destroy();
            return r(message.channel, message.author, "Successfully disconnected.").then(m => del(m, 7500));
        }

        if (!voiceChannel || !voiceChannel.id || voiceChannel.id !== player.voiceChannel)
            return r(message.channel, message.author, "You need to be in the voice channel to use the leave command.").then(m => del(m, 7500));

        player.destroy();
        return r(message.channel, message.author, "Successfully disconnected.").then(m => del(m, 7500));
    }
}