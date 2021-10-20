const { del } = require("../../functions.js");

module.exports = {
    name: "trackrepeat",
    aliases: ["songrepeat", "repeatsong"],
    category: "music",
    description: "Makes the bot repeat the song currently playing.",
    permissions: "member",
    run: (client, message, args) => {
        const player = client.music.players.get(message.guild.id);
        if (!player) return message.reply("No song/s currently playing in this guild.");

        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel || voiceChannel.id !== player.voiceChannel)
            return message.reply("You need to be the voice channel to pause music.").then(m => del(m, 7500));

        if (player.trackRepeat)
            player.setTrackRepeat(false);
        else
            player.setTrackRepeat(true);

        return message.reply(`Track reapeat is now ${player.trackRepeat ? "enabled" : "disabled"}.`).then(m => del(m, 7500));
    }
}