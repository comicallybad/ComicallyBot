const { s, r, del } = require("../../functions.js");
const { MessageEmbed } = require("discord.js");

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

        if (!args[0]) {
            const currentVol = player.volume / 10;
            const currentVolFloor = Math.floor(player.volume / 10);
            const currentVolLevel = currentVol > currentVolFloor ? `${"🔊".repeat(currentVolFloor)} 🔉 ${"🔈".repeat(10 - currentVol)}` : `${"🔊".repeat(currentVolFloor)} ${"🔈".repeat(10 - currentVol)}`;

            const embed = new MessageEmbed()
                .setAuthor({ name: `Volume Level!`, iconURL: message.author.displayAvatarURL() })
                .setThumbnail(player.queue.current.thumbnail)
                .setDescription(`The volume has been set to: **${player.volume}%** ${currentVolLevel}`);

            return s(message.channel, '', embed).then(m => del(m, 15000));
        }

        if (isNaN(args[0]))
            return r(message.channel, message.author, "Please provide a number 1-100").then(m => del(m, 7500));

        if (Number(args[0]) <= 0 || Number(args[0]) > 100)
            return r(message.channel, message.author, "You may only set the volume to 1-100").then(m => del(m, 7500));

        player.setVolume(Number(args[0]));

        const vol = Number(args[0]) / 10;
        const volFloor = Math.floor(Number(args[0]) / 10);
        const volLevel = vol > volFloor ? `${"🔊".repeat(volFloor)} 🔉 ${"🔈".repeat(10 - vol)}` : `${"🔊".repeat(volFloor)} ${"🔈".repeat(10 - vol)}`;

        const embed = new MessageEmbed()
            .setAuthor({ name: `Volume Changed!`, iconURL: message.author.displayAvatarURL() })
            .setThumbnail(player.queue.current.thumbnail)
            .setDescription(`The volume has been set to: **${Number(args[0])}%** ${volLevel}`);

        return s(message.channel, '', embed).then(m => del(m, 15000));
    }
}