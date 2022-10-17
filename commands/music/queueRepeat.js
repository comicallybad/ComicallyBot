const { s, r, del } = require("../../functions.js");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "queuerepeat",
    aliases: ["qrepeat"],
    category: "music",
    description: "Makes the bot repeat the current queue playing.",
    permissions: "member",
    run: (client, message, args) => {
        const player = client.music.players.get(message.guild.id);
        if (!player || !player.queue.current) return r(message.channel, message.author, "No song/s currently playing in this guild.");

        const voiceChannel = message.member.voice.channel;

        if (!voiceChannel || voiceChannel.id !== player.voiceChannel)
            return r(message.channel, message.author, "You need to be the voice channel to pause music.").then(m => del(m, 7500));

        player.setTextChannel(message.channel.id);

        if (player.queueRepeat) player.setQueueRepeat(false);
        else player.setQueueRepeat(true);

        const embed = new MessageEmbed()
            .setAuthor({ name: `Queue Repeat ${player.queueRepeat ? "**ON**" : "**OFF**"}!`, iconURL: message.author.displayAvatarURL() })
            .setThumbnail(player.queue.current.thumbnail)
            .setDescription(`The player queue repeat has been toggled ${player.queueRepeat ? "**ON** - (the queue will now loop) 🔁" : "**OFF** - (the queue will no longer loop) ❌🔁"}.`);

        return s(message.channel, '', embed).then(m => del(m, 15000));
    }
}