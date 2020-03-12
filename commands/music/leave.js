const { del } = require("../../functions.js");

module.exports = {
    name: "leave",
    aliases: ["quit", "stop"],
    category: "music",
    description: "Disconnects the bot from the voice channel.",
    permissions: "member",
    run: (client, message, args) => {
        const voiceChannel = message.member.voice.channel;
        const player = client.music.players.get(message.guild.id);

        if (!player) return message.reply("No song/s currently playing in this guild.").then(m => del(m, 7500));
        if (!voiceChannel || voiceChannel.id !== player.voiceChannel.id)
            return message.reply("You need to be the voice channel to use the leave command.").then(m => del(m, 7500));

        client.music.players.destroy(message.guild.id);
        return message.reply("Successfully disconnected.").then(m => del(m, 7500));
    }
}