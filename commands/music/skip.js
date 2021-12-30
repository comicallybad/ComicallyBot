const { r, del } = require("../../functions.js");

module.exports = {
    name: "skip",
    aliases: ["next"],
    category: "music",
    description: "Skips the current song.",
    permissions: "member",
    run: (client, message, args) => {
        const player = client.music.players.get(message.guild.id);
        if (!player) return r(message.channel, message.author, "No song/s currently playing in this guild.").then(m => del(m, 7500));

        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel || voiceChannel.id !== player.voiceChannel)
            return r(message.channel, message.author, "You need to be in the voice channel to use the skip command.").then(m => del(m, 7500));

        player.stop();
        return r(message.channel, message.author, "Skipped the current song!").then(m => del(m, 7500));
    }
}