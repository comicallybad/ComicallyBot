const { s, r, del } = require("../../functions.js");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "pause",
    category: "music",
    description: "Makes the bot pause/resume the music currently playing.",
    permissions: "member",
    run: (client, message, args) => {
        const player = client.music.players.get(message.guild.id);
        if (!player || !player.queue.current) return r(message.channel, message.author, "No song/s currently playing in this guild.");

        const voiceChannel = message.member.voice.channel;

        if (!voiceChannel || voiceChannel.id !== player.voiceChannel)
            return r(message.channel, message.author, "You need to be in the voice channel to pause music.").then(m => del(m, 7500));

        player.setTextChannel(message.channel.id);
        player.pause(true);

        const embed = new MessageEmbed()
            .setAuthor({ name: `Player Paused!`, iconURL: message.author.displayAvatarURL() })
            .setThumbnail(player.queue.current.thumbnail)
            .setDescription(`⏸ The player has been paused! Use \`${prefix}play\` to resume playing. ▶`);

        return s(message.channel, '', embed).then(m => del(m, 15000));
    }
}
