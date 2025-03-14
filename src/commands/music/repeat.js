const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { r, re, delr } = require("../../../utils/functions/functions.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("repeat")
        .setDescription("Repeats the current track or entire song queue.")
        .addSubcommand(command => command.setName("track").setDescription("Repeat current track."))
        .addSubcommand(command => command.setName("queue").setDescription("Repeat entire queue.")),
    execute: (interaction, client) => {
        const subcommand = interaction.options.getSubcommand();
        const player = client.music.players.get(interaction.guild.id);

        if (!player || !player.current)
            return re(interaction, "No song(s) currently playing in this guild.").then(() => delr(interaction, 7500));

        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel || voiceChannel.id !== player.voiceChannelId)
            return re(interaction, "You need to be in the voice channel to pause music.").then(() => delr(interaction, 7500));

        player.setTextChannelId(interaction.channel.id);

        switch (subcommand) {
            case "track":
                return trackRepeat(interaction, player);
            case "queue":
                return queueRepeat(interaction, player);
        }
    }
}

function trackRepeat(interaction, player) {
    if (player.loop !== "off" && player.loop !== "queue") player.setLoop("off");
    else player.setLoop("track");

    const embed = new EmbedBuilder()
        .setAuthor({ name: `Track Repeat: ${player.loop !== "off" ? "ON" : "OFF"}!`, iconURL: interaction.user.displayAvatarURL() })
        .setThumbnail(player.current.thumbnail)
        .setColor("#0EFEFE")
        .setDescription(`Track repeat has been toggled ${player.loop !== "off" ? "**ON**\n(The current track will now repeat) 🔁" : "**OFF**\n(The current track will no longer repeat) ❌🔁"}`);

    return r(interaction, "", embed).then(() => delr(interaction, 30000));
}

function queueRepeat(interaction, player) {
    if (player.loop !== "off" && player.loop !== "track") player.setLoop("off");
    else player.setLoop("queue");

    const embed = new EmbedBuilder()
        .setAuthor({ name: `Queue Repeat: ${player.loop !== "off" ? "ON" : "OFF"}!`, iconURL: interaction.user.displayAvatarURL() })
        .setThumbnail(player.current.thumbnail)
        .setColor("#0EFEFE")
        .setDescription(`The player queue repeat has been toggled ${player.loop !== "off" ? "**ON**\n(The queue will now repeat) 🔁" : "**OFF**\n(The queue will no longer repeat) ❌🔁"}`);

    return r(interaction, "", embed).then(() => delr(interaction, 30000));
}