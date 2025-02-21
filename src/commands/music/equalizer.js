const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { r, re, delr } = require("../../../utils/functions/functions.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("eq")
        .setDescription("Adjusts the music equalizer.")
        .addSubcommand(command => command.setName("normal").setDescription("Sets the equalizer to normal."))
        .addSubcommand(command => command.setName("bass").setDescription("Boosts the bass."))
        .addSubcommand(command => command.setName("high").setDescription("Boosts the high frequencies."))
        .addSubcommand(command => command.setName("band").setDescription("Sets the equalizer to band-pass.")),
    execute: (interaction, client) => {
        const subcommand = interaction.options.getSubcommand();
        const player = client.music.players.get(interaction.guild.id);

        if (!player || !player.current)
            return re(interaction, "No song(s) currently playing in this guild.").then(() => delr(interaction, 7500));

        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel || voiceChannel.id !== player.voiceChannelId)
            return re(interaction, "You need to be in the voice channel to adjust the equalizer.").then(() => delr(interaction, 7500));

        switch (subcommand) {
            case "normal":
                return normalEQ(interaction, player);
            case "bass":
                return bassEQ(interaction, player);
            case "high":
                return highEQ(interaction, player);
            case "band":
                return bandEQ(interaction, player);
        }
    }
}

function normalEQ(interaction, player) {
    player.filters.resetFilters();

    const embed = new EmbedBuilder()
        .setAuthor({ name: `Equalizer Set To Normal.`, iconURL: interaction.user.displayAvatarURL() })
        .setThumbnail(player.current.thumbnail)
        .setDescription(`The equalizer has been set to **normal.**`);

    return r(interaction, "", embed).then(() => delr(interaction, 30000));
}

function bassEQ(interaction, player) {
    player.filters.setEqualizer([
        { band: 0, gain: 0.25 },
        { band: 1, gain: 0.3 },
        { band: 2, gain: 0.3 },
        { band: 3, gain: 0 },
        { band: 4, gain: -0.2 },
        { band: 5, gain: 0.1 }
    ]);

    const embed = new EmbedBuilder()
        .setAuthor({ name: `Equalizer Set To Bass Boosted.`, iconURL: interaction.user.displayAvatarURL() })
        .setThumbnail(player.current.thumbnail)
        .setColor("#0EFEFE")
        .setDescription(`The equalizer has been set to **bass boosted.**`);

    return r(interaction, "", embed).then(() => delr(interaction, 30000));
}

async function highEQ(interaction, player) {
    player.filters.setEqualizer([
        { band: 0, gain: -0.5 },
        { band: 1, gain: 0 },
        { band: 2, gain: 0 },
        { band: 3, gain: 0.5 },
        { band: 4, gain: 1.0 },
        { band: 5, gain: 1.0 }
    ]);

    const embed = new EmbedBuilder()
        .setAuthor({ name: `Equalizer Set To High Boosted.`, iconURL: interaction.user.displayAvatarURL() })
        .setThumbnail(player.current.thumbnail)
        .setDescription(`The equalizer has been set to **high pass.**`);

    return r(interaction, "", embed).then(() => delr(interaction, 30000));
}

async function bandEQ(interaction, player) {
    player.filters.setEqualizer([
        { band: 0, gain: -0.5 },
        { band: 1, gain: 0.5 },
        { band: 2, gain: 0.5 },
        { band: 3, gain: 0.5 },
        { band: 4, gain: -0.5 },
        { band: 5, gain: -0.5 }
    ]);

    const embed = new EmbedBuilder()
        .setAuthor({ name: `Equalizer Set To Band Pass.`, iconURL: interaction.user.displayAvatarURL() })
        .setThumbnail(player.current.thumbnail)
        .setDescription(`The equalizer has been set to **band pass.**`);

    return r(interaction, "", embed).then(() => delr(interaction, 30000));
}