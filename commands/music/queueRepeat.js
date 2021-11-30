const { del } = require("../../functions.js");

module.exports = {
    name: "queuerepeat",
    aliases: ["qrepeat", "repeatq", "repeatqueue"],
    category: "music",
    description: "Makes the bot repeat the current queue playing.",
    permissions: "member",
    run: (client, message, args) => {
        const player = client.music.players.get(message.guild.id);
        if (!player) return r(message.channel, message.author, "No song/s currently playing in this guild.");

        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel || voiceChannel.id !== player.voiceChannel)
            return r(message.channel, message.author, "You need to be the voice channel to pause music.").then(m => del(m, 7500));

        if (player.queueRepeat)
            player.setQueueRepeat(false);
        else
            player.setQueueRepeat(true);

        return message.reply(`Queue reapeat is now ${player.queueRepeat ? "enabled" : "disabled"}.`).then(m => del(m, 7500));
    }
}