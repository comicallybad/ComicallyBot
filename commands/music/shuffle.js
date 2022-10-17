const { s, r, del } = require("../../functions.js");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "shuffle",
    aliases: ["shuff"],
    category: "music",
    description: "Shuffles the music queue.",
    permissions: "member",
    run: (client, message, args) => {
        const player = client.music.players.get(message.guild.id);
        if (!player || !player.queue.current) return r(message.channel, message.author, "No song currently playing in this guild").then(m => del(m, 7500));

        const voiceChannel = message.member.voice.channel;

        if (!voiceChannel || voiceChannel.id !== player.voiceChannel)
            return r(message.channel, message.author, "You need to be in the voice channel to play music.").then(m => del(m, 7500));

        player.setTextChannel(message.channel.id);
        player.queue.shuffle();

        const embed = new MessageEmbed()
            .setAuthor({ name: "Queue Shuffled!", iconURL: message.author.displayAvatarURL() })
            .setThumbnail(player.queue.current.thumbnail)
            .setDescription("🔀 The song queue has been shuffled randomly!");

        return s(message.channel, '', embed).then(m => del(m, 15000));
    }
}