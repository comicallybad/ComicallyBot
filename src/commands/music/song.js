const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const humanizeDuration = require("humanize-duration");
const { r, re, delr } = require("../../../utils/functions/functions.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("song")
        .setDescription("Displays what song is currently playing."),
    execute: async (interaction, client) => {
        const player = client.music.players.get(interaction.guild.id);

        if (!player || !player.current)
            return re(interaction, "No song(s) currently playing in this guild.").then(() => delr(interaction, 7500));

        const { title, author, duration, position, thumbnail, url } = player.current;
        const requester = await client.users.fetch(player.current.requestedBy.id);
        const totalLength = Math.floor(duration / 1000) * 1000;
        const currentPosition = Math.floor(position / 1000) * 1000;

        const embed = new EmbedBuilder()
            .setAuthor({ name: "Current Song!", iconURL: interaction.guild.iconURL() })
            .setThumbnail(thumbnail ? thumbnail : interaction.guild.iconURL())
            .setColor("#0EFEFE")
            .setDescription(`${!player.paused ? "▶️" : "⏸️"} [**${title.includes(author) ? title : `${title} by ${author}`}**](${url}) \`${humanizeDuration(totalLength)}\`
            Currently at: \`${humanizeDuration(currentPosition)}\`.`)
            .setFooter({ text: `Requested by ${requester.tag}`, iconURL: requester.displayAvatarURL() });

        return r(interaction, "", embed).then(() => delr(interaction, 30000));
    }
}