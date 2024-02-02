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
        const player = client.music.players.get(interaction.guild.id);

        if (!player || !player.queue.current)
            return re(interaction, "No song(s) currently playing in this guild.").then(() => delr(interaction, 7500));

        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel || voiceChannel.id !== player.voiceChannel)
            return re(interaction, "You need to be in the voice channel to adjust the equalizer.").then(() => delr(interaction, 7500));


        if (interaction.options.getSubcommand() === "normal") return normalEQ(interaction, player);
        else if (interaction.options.getSubcommand() === "bass") return bassEQ(interaction, player);
        else if (interaction.options.getSubcommand() === "high") return highEQ(interaction, player);
        else if (interaction.options.getSubcommand() === "band") return bandEQ(interaction, player);
    }
}

function normalEQ(interaction, player) {
    player.clearEQ();

    const embed = new EmbedBuilder()
        .setAuthor({ name: `Equalizer Set To Normal.`, iconURL: interaction.user.displayAvatarURL() })
        .setThumbnail(player.queue.current.thumbnail)
        .setDescription(`The equalizer has been set to **normal.**\n(This takes a second to apply).`);

    return r(interaction, "", embed).then(() => delr(interaction, 30000));
}

async function bassEQ(interaction, player) {
    player.clearEQ();
    await new Promise(resolve => setTimeout(resolve, 500));
    player.setEQ([
        { band: 0, gain: 0.6 },
        { band: 1, gain: 0.67 },
        { band: 2, gain: 0.67 },
        { band: 3, gain: 0 },
        { band: 4, gain: -0.5 },
        { band: 5, gain: 0.15 }
    ]);
    const embed = new EmbedBuilder()
        .setAuthor({ name: `Equalizer Set To Bass Boosted.`, iconURL: interaction.user.displayAvatarURL() })
        .setThumbnail(player.queue.current.thumbnail)
        .setColor("#0EFEFE")
        .setDescription(`The equalizer has been set to **bass boosted.**\n(This takes a second to apply).`);

    return r(interaction, "", embed).then(() => delr(interaction, 30000));
}

async function highEQ(interaction, player) {
    player.clearEQ();
    await new Promise(resolve => setTimeout(resolve, 500));
    player.setEQ([
        { band: 0, gain: -0.5 },
        { band: 1, gain: 0 },
        { band: 2, gain: 0 },
        { band: 3, gain: 0.5 },
        { band: 4, gain: 1.0 },
        { band: 5, gain: 1.5 }
    ]);
    const embed = new EmbedBuilder()
        .setAuthor({ name: `Equalizer Set To High Boosted.`, iconURL: interaction.user.displayAvatarURL() })
        .setThumbnail(player.queue.current.thumbnail)
        .setDescription(`The equalizer has been set to **high pass.**\n(This takes a second to apply).`);

    return r(interaction, "", embed).then(() => delr(interaction, 30000));
}

async function bandEQ(interaction, player) {
    player.clearEQ();
    await new Promise(resolve => setTimeout(resolve, 500));
    player.setEQ([
        { band: 0, gain: -0.5 },
        { band: 1, gain: 0.7 },
        { band: 2, gain: 1.0 },
        { band: 3, gain: 0.7 },
        { band: 4, gain: -0.5 },
        { band: 5, gain: -0.5 }
    ]);
    const embed = new EmbedBuilder()
        .setAuthor({ name: `Equalizer Set To Band Pass.`, iconURL: interaction.user.displayAvatarURL() })
        .setThumbnail(player.queue.current.thumbnail)
        .setDescription(`The equalizer has been set to **band pass.**\n(This takes a second to apply).`);

    return r(interaction, "", embed).then(() => delr(interaction, 30000));
}