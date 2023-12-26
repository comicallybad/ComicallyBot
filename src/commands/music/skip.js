const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const humanizeDuration = require("humanize-duration");
const { r, re, delr } = require("../../../utils/functions/functions.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("skip")
        .setDescription("Skips the current song.")
        .addSubcommand(command => command.setName("song").setDescription("Skip the current song in queue."))
        .addSubcommand(command => command.setName("to").setDescription("Skip to a time in a song.")
            .addStringOption(option => option.setName('time').setDescription('The time to skip to in the song. Append "s" for seconds and "m" for minutes.').setRequired(true)))
        .addSubcommand(command => command.setName("ahead").setDescription("Skip ahead in the current song.")
            .addStringOption(option => option.setName('time').setDescription('The time to skip ahead in the song. Append "s" for seconds and "m" for minutes.').setRequired(true))),
    execute: (interaction, client) => {
        const player = client.music.players.get(interaction.guild.id);

        if (!player || !player.queue.current)
            return re(interaction, "No song(s) currently playing in this guild.").then(() => delr(interaction, 7500));

        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel || voiceChannel.id !== player.voiceChannel)
            return re(interaction, "You need to be in the voice channel to pause music.").then(() => delr(interaction, 7500));

        if (interaction.options.getSubcommand() === "song") skipSong(interaction, player);
        else if (interaction.options.getSubcommand() === "to") skipTo(interaction, player);
        else if (interaction.options.getSubcommand() === "ahead") skipAhead(interaction, player);
    }
}

function skipSong(interaction, player) {
    player.setTextChannel(interaction.channel.id);
    player.stop();

    const embed = new EmbedBuilder()
        .setAuthor({ name: "Song Skipped!", iconURL: interaction.user.displayAvatarURL() })
        .setDescription("⏩ The current song has been skipped!");

    return r(interaction, "", embed).then(() => delr(interaction, 30000));
}

function parseTime(timeStr) {
    const match = timeStr.replace(/\s/g, '').match(/(\d+)(s|sec|secs|second|seconds|m|min|mins|minute|minutes|h|hour|hours)?/g);
    if (!match) {
        throw new Error('Invalid time format');
    }
    let time = 0;
    match.forEach((part) => {
        const partMatch = part.match(/(\d+)(s|sec|secs|second|seconds|m|min|mins|minute|minutes|h|hour|hours)?/);
        const partTime = parseInt(partMatch[1], 10);
        const unit = partMatch[2];
        if (!unit || unit.startsWith('s')) {
            time += partTime;
        } else if (unit.startsWith('m')) {
            time += partTime * 60;
        } else if (unit.startsWith('h')) {
            time += partTime * 3600;
        } else {
            throw new Error('Invalid time unit');
        }
    });
    return time;
}

function skipTo(interaction, player) {
    const timeStr = interaction.options.getString('time');
    let time;
    try {
        time = parseTime(timeStr);
    } catch (err) {
        return re(interaction, "Please provide a valid time to skip to.").then(() => delr(interaction, 7500));
    }

    player.setTextChannel(interaction.channel.id);
    player.seek(time * 1000);

    const embed = new EmbedBuilder()
        .setAuthor({ name: "Song Time Set!", iconURL: interaction.user.displayAvatarURL() })
        .setThumbnail(player.queue.current.thumbnail)
        .setDescription(`⏩ The current song has been skipped to \`${humanizeDuration(time * 1000)}\`!`);

    return r(interaction, "", embed).then(() => delr(interaction, 30000));
}

function skipAhead(interaction, player) {
    const timeStr = interaction.options.getString('time');
    let time;
    try {
        time = parseTime(timeStr);
    } catch (err) {
        return re(interaction, "Please provide a valid time to skip ahead to.").then(() => delr(interaction, 7500));
    }

    player.setTextChannel(interaction.channel.id);
    player.seek(player.position + (time * 1000));

    const embed = new EmbedBuilder()
        .setAuthor({ name: "Song Time Set!", iconURL: interaction.user.displayAvatarURL() })
        .setThumbnail(player.queue.current.thumbnail)
        .setDescription(`⏩ The current song time has been skipped \`${humanizeDuration(time * 1000)}\` to \`${humanizeDuration(player.position)}\`!`);

    return r(interaction, "", embed).then(() => delr(interaction, 30000));
}