const { del } = require("../../functions.js");

module.exports = {
    name: "volume",
    aliases: ["vol"],
    category: "music",
    description: "Changes the volume of the bot.",
    permissions: "member",
    usage: "<volume>",
    run: (client, message, args) => {
        const player = client.music.players.get(message.guild.id);
        if (!player)
            return message.reply("No song/s currently playing within this guild.").then(m => del(m, 7500));

        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel || voiceChannel.id !== player.voiceChannel.id)
            return message.reply("You need to be in a voice channel to adjust the volume.").then(m => del(m, 7500));

        if (!args[0])
            return message.reply(`Current Volume: ${player.volume}`).then(m => del(m, 7500));

        if (Number(args[0]) <= 0 || Number(args[0]) > 100)
            return message.reply("You may only set the volume to 1-100").then(m => del(m, 7500));

        player.setVolume(Number(args[0]));
        return message.reply(`Successfully set the volume to: ${args[0]}`).then(m => del(m, 7500));
    }
}