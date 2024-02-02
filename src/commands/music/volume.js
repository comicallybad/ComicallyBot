const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { r, re, delr } = require("../../../utils/functions/functions.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("volume")
        .setDescription("Changes the volume of the music player.")
        .addIntegerOption(option => option.setName("input").setDescription("The volume percentage input.").setRequired(true)),
    execute: (interaction, client) => {
        const volume = interaction.options.get("input").value;
        const player = client.music.players.get(interaction.guild.id);

        if (!player || !player.queue.current)
            return re(interaction, "No song(s) currently playing in this guild.").then(() => delr(interaction, 7500));

        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel || voiceChannel.id !== player.voiceChannel)
            return re(interaction, "You need to be in the voice channel to pause music.").then(() => delr(interaction, 7500));

        if (volume <= 0 || volume > 100)
            return re(interaction, "You may only set the volume to 1-100.").then(() => delr(interaction, 7500));

        player.setVolume(volume);

        const vol = volume / 10;
        const volFloor = Math.floor(volume / 10);
        const volLevel = vol > volFloor ? `${"🔊".repeat(volFloor)} 🔉 ${"🔈".repeat(10 - vol)}` : `${"🔊".repeat(volFloor)} ${"🔈".repeat(10 - vol)}`;

        const embed = new EmbedBuilder()
            .setAuthor({ name: `Volume Changed!`, iconURL: interaction.user.displayAvatarURL() })
            .setThumbnail(player.queue.current.thumbnail)
            .setColor("#0EFEFE")
            .setDescription(`The volume has been set to: **${volume}%** ${volLevel}`);

        return r(interaction, "", embed).then(() => delr(interaction, 30000));
    }
}