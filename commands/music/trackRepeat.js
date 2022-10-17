const { s, r, del } = require("../../functions.js");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "trackrepeat",
    aliases: ["songrepeat", "repeatsong"],
    category: "music",
    description: "Makes the bot repeat the song currently playing.",
    permissions: "member",
    run: (client, message, args) => {
        const player = client.music.players.get(message.guild.id);
        if (!player || !player.queue.current)
            return r(message.channel, message.author, "No song/s currently playing in this guild.");

        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel || voiceChannel.id !== player.voiceChannel)
            return r(message.channel, message.author, "You need to be the voice channel to pause music.").then(m => del(m, 7500));

        if (player.trackRepeat) player.setTrackRepeat(false);
        else player.setTrackRepeat(true);

        const embed = new MessageEmbed()
            .setAuthor({ name: `Track Repeat ${player.trackRepeat ? "**ON**" : "**OFF**"}!`, iconURL: message.author.displayAvatarURL() })
            .setThumbnail(player.queue.current.thumbnail)
            .setDescription(`Track repeat has been toggled ${player.trackRepeat ? "**ON** - (the current track will now loop) 🔁" : "**OFF** - (the current track will no longer loop) ❌🔁"}.`);

        return s(message.channel, '', embed).then(m => del(m, 15000));
    }
}