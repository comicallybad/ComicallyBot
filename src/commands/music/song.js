const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const humanizeDuration = require("humanize-duration");
const { r, re, delr } = require("../../../utils/functions/functions.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("song")
        .setDescription("Displays what song is currently playing."),
    execute: (interaction, client) => {
        const player = client.music.players.get(interaction.guild.id);

        if (!player || !player.queue.current)
            return re(interaction, "No song(s) currently playing in this guild.").then(() => delr(interaction, 7500));

        const { title, author, duration, thumbnail, uri } = player.queue.current;
        const embed = new EmbedBuilder()
            .setAuthor({ name: "Current Song!", iconURL: interaction.guild.iconURL() })
            .setThumbnail(thumbnail ? thumbnail : interaction.guild.iconURL())
            .setDescription(`${player.playing ? "▶️" : "⏸️"} [**${title.includes(author) ? title : `${title} by ${author}`}**](${uri}) \`${humanizeDuration(duration)}\`
            Currently at: \`${humanizeDuration(player.position)}\`.`)
            .setFooter({ text: `Requested by ${player.queue.current.requester.tag}`, iconURL: player.queue.current.requester.displayAvatarURL() });

        return r(interaction, "", embed).then(() => delr(interaction, 30000));
    }
}