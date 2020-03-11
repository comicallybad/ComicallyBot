const { del } = require("../../functions.js");
const { Utils } = require("erela.js")
const { MessageEmbed } = require("discord.js")

module.exports = {
    name: "nowplaying",
    aliases: ["np", "now", "playing", "song", "current"],
    category: "music",
    description: "Displays what song is currently playing.",
    permissions: "member",
    run: (client, message, args) => {
        const player = client.music.players.get(message.guild.id);
        if (!player || !player.queue[0]) return message.reply("No song/s currently playing within this guild.").then(m => del(m, 7500));
        const { title, author, duration, thumbnail } = player.queue[0];

        const embed = new MessageEmbed()
            .setAuthor("Current Song Playing.", message.author.displayAvatarURL)
            .setThumbnail(thumbnail)
            .setDescription(`${player.playing ? "▶️" : "⏸️"} **${title}** \`${Utils.formatTime(duration, true)}\` by ${author}`)

        return message.channel.send(embed).then(m => del(m, 15000));
    }
}