const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { r, re, delr } = require("../../../utils/functions/functions.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("shuffle")
        .setDescription("Shuffles the current song queue."),
    execute: (interaction, client) => {
        const player = client.music.players.get(interaction.guild.id);

        if (!player || !player.queue.current)
            return re(interaction, "No song(s) currently playing in this guild.").then(() => delr(interaction, 7500));

        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel || voiceChannel.id !== player.voiceChannel)
            return re(interaction, "You need to be in the voice channel to pause music.").then(() => delr(interaction, 7500));

        player.setTextChannel(interaction.channel.id);
        player.queue.shuffle();

        const embed = new EmbedBuilder()
            .setAuthor({ name: "Queue Shuffled!", iconURL: interaction.user.displayAvatarURL() })
            .setThumbnail(player.queue.current.thumbnail)
            .setColor("#0EFEFE")
            .setDescription("🔀 The song queue has been shuffled randomly!");

        return r(interaction, "", embed).then(() => delr(interaction, 30000));
    }
}