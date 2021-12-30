const { s, r, del } = require("../../functions.js");
const humanizeDuration = require("humanize-duration");
const { MessageEmbed } = require("discord.js")

module.exports = {
    name: "nowplaying",
    aliases: ["np", "song", "songname"],
    category: "music",
    description: "Displays what song is currently playing.",
    permissions: "member",
    run: (client, message, args) => {
        const player = client.music.players.get(message.guild.id);
        if (!player || !player.queue.current) return r(message.channel, message.author, "No song/s currently playing within this guild.").then(m => del(m, 7500));
        const { title, author, duration, thumbnail } = player.queue.current;

        const embed = new MessageEmbed()
            .setAuthor("Current Song Playing.", message.author.displayAvatarURL())
            .setThumbnail(thumbnail)
            .setDescription(`${player.playing ? "▶️" : "⏸️"} **${title}** \`${humanizeDuration(duration)}\` by ${author}`)

        return s(message.channel, '', embed).then(m => del(m, 15000));
    }
}