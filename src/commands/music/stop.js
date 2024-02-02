const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { r, re, delr } = require("../../../utils/functions/functions.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("stop")
        .setDescription("Disconnects the bot from the voice channel."),
    execute: (interaction, client) => {
        const player = client.music.players.get(interaction.guild.id);

        if (!player || !player.queue.current)
            return re(interaction, "No song(s) currently playing in this guild.").then(() => delr(interaction, 7500));

        player.destroy();

        const embed = new EmbedBuilder()
            .setAuthor({ name: "Music Player Disconnected!", iconURL: interaction.user.displayAvatarURL() })
            .setColor("#FF0000")
            .setDescription("🛑 The music player has successfully been disconnected!");

        return r(interaction, "", embed).then(() => delr(interaction, 30000));
    },
};
