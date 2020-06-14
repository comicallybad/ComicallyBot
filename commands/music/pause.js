const { del } = require("../../functions.js");

module.exports = {
    name: "pause",
    aliases: ["resume"],
    category: "music",
    description: "Makes the bot pause/resume the music currently playing.",
    permissions: "member",
    run: (client, message, args) => {
        const player = client.music.players.get(message.guild.id);
        if (!player) return message.reply("No song/s currently playing in this guild.");

        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel || voiceChannel.id !== player.voiceChannel.id)
            return message.reply("You need to be in a voice channel to pause music.").then(m => del(m, 7500));

        player.pause(player.playing);
        return message.reply(`Player is now ${player.playing ? "resumed" : "paused"}.`).then(m => del(m, 7500));
    }
}
