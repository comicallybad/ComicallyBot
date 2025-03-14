const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { r, re, delr } = require("../../../utils/functions/functions.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("pause")
        .setDescription("Pause the current song."),
    execute: (interaction, client) => {
        const player = client.music.players.get(interaction.guild.id);

        if (!player || !player.current)
            return re(interaction, "No song(s) currently playing in this guild.").then(() => delr(interaction, 7500));

        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel || voiceChannel.id !== player.voiceChannelId)
            return re(interaction, "You need to be in the voice channel to pause music.").then(() => delr(interaction, 7500));

        player.setTextChannelId(interaction.channel.id);
        player.pause();

        const embed = new EmbedBuilder()
            .setAuthor({ name: `Player Paused!`, iconURL: interaction.user.displayAvatarURL() })
            .setThumbnail(player.current.thumbnail)
            .setColor("#0EFEFE")
            .setDescription(`⏸ The player has been paused! Use \`/play\` to resume playing. ▶️`);

        return r(interaction, "", embed).then(() => delr(interaction, 30000));
    }
}
