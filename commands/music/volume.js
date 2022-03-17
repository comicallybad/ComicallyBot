const { r, del } = require("../../functions.js");

module.exports = {
    name: "volume",
    aliases: ["vol"],
    category: "music",
    description: "Changes the volume of the bot.",
    permissions: "member",
    usage: "<volume>",
    run: (client, message, args) => {
        const player = client.music.players.get(message.guild.id);
        if (!player || !player.queue.current)
            return r(message.channel, message.author, "No song/s currently playing within this guild.").then(m => del(m, 7500));
        const voiceChannel = message.member.voice.channel;

        if (!voiceChannel || voiceChannel.id !== player.voiceChannel)
            return r(message.channel, message.author, "You need to be in the voice channel to adjust the volume.").then(m => del(m, 7500));

        if (!args[0])
            return r(message.channel, message.author, `Current Volume: ${player.volume}`).then(m => del(m, 7500));

        if (isNaN(args[0]))
            return r(message.channel, message.author, "Please provide a number 1-100").then(m => del(m, 7500));

        if (Number(args[0]) <= 0 || Number(args[0]) > 100)
            return r(message.channel, message.author, "You may only set the volume to 1-100").then(m => del(m, 7500));

        player.setVolume(Number(args[0]));
        return r(message.channel, message.author, `Successfully set the volume to: ${args[0]}`).then(m => del(m, 7500));
    }
}