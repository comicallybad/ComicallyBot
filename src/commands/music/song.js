const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const humanizeDuration = require("humanize-duration");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("song")
        .setDescription("Displays what song is currently playing."),

    execute: (client, interaction) => {
        const player = client.music.players.get(interaction.guild.id);

        if (!player || !player.queue.current)
            return interaction.reply({ content: "No song(s) currently playing in this guild.", ephemeral: true })
                .then(setTimeout(() => interaction.deleteReply().catch(err => err), 7500));

        const { title, author, duration, thumbnail } = player.queue.current;
        const embed = new EmbedBuilder()
            .setAuthor({ name: "Current Song!", iconURL: interaction.user.displayAvatarURL() })
            .setThumbnail(thumbnail)
            .setDescription(`${player.playing ? "▶️" : "⏸️"} **${title}** \`${humanizeDuration(duration)}\` by ${author}`)

        return interaction.reply({ embeds: [embed] })
            .then(setTimeout(() => interaction.deleteReply().catch(err => err), 15000));
    }
}