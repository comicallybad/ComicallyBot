const { s, r, del } = require("../../functions.js");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "leave",
    aliases: ["stop"],
    category: "music",
    description: "Disconnects the bot from the voice channel.",
    permissions: "member",
    run: (client, message, args) => {
        const player = client.music.players.get(message.guild.id);
        if (!player) return r(message.channel, message.author, "No song/s currently playing in this guild.").then(m => del(m, 7500));

        player.destroy();

        const embed = new MessageEmbed()
            .setAuthor({ name: "Music Player Disconnected!", iconURL: message.author.displayAvatarURL() })
            .setDescription("🛑 The music player has successfully been disconnected!");

        return s(message.channel, '', embed).then(m => del(m, 15000));
    }
}