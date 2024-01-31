const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const humanizeDuration = require("humanize-duration");
const { r, re, delr, del } = require("../../../utils/functions/functions.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("Resume music or queue a song from YouTube/SoundCloud.")
        .addStringOption(option => option.setName("song").setDescription("The song/URL you want to play.").setAutocomplete(true)),
    autocomplete: async (interaction, client) => {
        const focusedValue = interaction.options.getFocused();
        const res = await client.music.search(focusedValue);

        let choices = res.tracks.map((x, i) => {
            let name = `${i + 1}) ${x.title}`;
            if (name.length > 100) {
                name = name.substring(0, 97) + '...';
            }
            return { name, value: `${x.uri}` };
        });

        if (focusedValue) choices = choices.filter(choice => choice.name.toLowerCase().includes(focusedValue.toLowerCase()));
        choices = choices.slice(0, 25);

        if (choices.length === 0) choices.push({ name: focusedValue, value: focusedValue });

        return await interaction.respond(choices).catch(err => err);
    },
    execute: async (interaction, client) => {
        const voiceChannel = interaction.member.voice.channel;
        const checkPlayer = client.music.players.get(interaction.guild.id);

        const checkPermsResult = await checkPerms(client, interaction, voiceChannel, checkPlayer);
        if (!checkPermsResult) return;

        const checkResumeResult = await checkResume(interaction, voiceChannel, checkPlayer);
        if (!checkResumeResult) return;

        const player = client.music.create({
            guild: interaction.guild.id,
            voiceChannel: voiceChannel.id,
            textChannel: interaction.channel.id,
            volume: 10,
            selfDeafen: true,
        });

        if (player.state !== "CONNECTED") player.connect();

        await re(interaction, "Loading...");
        const res = await client.music.search(interaction.options.get("song").value, interaction.user);
        handleLoadType(interaction, player, res);
    }
}

function checkPerms(client, interaction, voiceChannel, checkPlayer) {
    if (!voiceChannel)
        return re(interaction, "You must be in a voice channel to play music.").then(() => delr(interaction, 7500));

    const permissions = voiceChannel.permissionsFor(client.user);

    if (!permissions.has(PermissionFlagsBits.ViewChannel && PermissionFlagsBits.Connect && PermissionFlagsBits.Speak))
        return re(interaction, "I am missing permissions to `VIEW_CHANNEL`, `CONNECT`, or `SPEAK`!").then(() => delr(interaction, 7500));

    if (!interaction.options.get("song") && !checkPlayer)
        return re(interaction, "Please provide a song name or link to search.").then(() => delr(interaction, 7500));

    return true;
}

function checkResume(interaction, voiceChannel, checkPlayer) {
    if (!interaction.options.get("song") && checkPlayer.voiceChannel === voiceChannel.id) {
        if (checkPlayer.playing)
            return re(interaction, "Please provide a song name or link to search.").then(() => delr(interaction, 7500));

        checkPlayer.setTextChannel(interaction.channel.id).pause(false);

        const embed = new EmbedBuilder()
            .setAuthor({ name: `Player resumed.`, iconURL: interaction.user.displayAvatarURL() })
            .setThumbnail(checkPlayer.queue.current ? checkPlayer.queue.current.thumbnail : interaction.guild.iconURL())
            .setDescription(`▶️ The player has been resumed. Use \`/pause\` to pause playing again. ⏸️`);

        return r(interaction, "", embed).then(() => delr(interaction, 15000));
    } else if (!interaction.options.get("song") && checkPlayer.voiceChannel !== voiceChannel.id) {
        checkPlayer.setTextChannel(interaction.channel.id).setVoiceChannel(voiceChannel.id);

        const embed = new EmbedBuilder()
            .setAuthor({ name: `Player joined.`, iconURL: interaction.user.displayAvatarURL() })
            .setThumbnail(checkPlayer.queue.current ? checkPlayer.queue.current.thumbnail : interaction.guild.iconURL())
            .setDescription(`▶️ The player has joined the voice channel to resume playing.`);

        return r(interaction, "", embed).then(() => delr(interaction, 15000));
    }

    return true;
}

function handleLoadType(interaction, player, response) {
    switch (response.loadType) {
        case "TRACK_LOADED":
            delr(interaction, 0);
            player.queue.add(response.tracks[0]);
            sendEmbed(interaction, "Song Added To Queue!", response.tracks[0]);
            startPlaying(player);
            break;

        case "SEARCH_RESULT":
            handleSearchResult(interaction, player, response.tracks.slice(0, 5));
            break;

        case "PLAYLIST_LOADED":
            delr(interaction, 0);
            sendPlaylistEmbed(interaction, "Playlist Added To Queue!", response);
            response.tracks.forEach(track => player.queue.add(track));
            startPlaying(player);
            break;

        default:
            er(interaction, "The provided track/url could not be loaded.");
            break;
    }
}

async function handleSearchResult(interaction, player, tracks) {
    let index = 1;
    const embed = new EmbedBuilder()
        .setAuthor({ name: "Song Selection.", iconURL: interaction.user.displayAvatarURL() })
        .setDescription(`${tracks.map(video => `**${index++} -** ${video.title}\n`).join('')}`)
        .setFooter({ text: "Select a track by clicking the buttons." });

    const buttons = tracks.map((video, index) => {
        return new ButtonBuilder()
            .setCustomId(`track_${index}`)
            .setLabel(`Track ${index + 1}`)
            .setStyle(ButtonStyle.Secondary);
    });

    const row = new ActionRowBuilder().addComponents(buttons);
    await interaction.editReply({ content: "", embeds: [embed], components: [row], ephemeral: true });
    const filter = (i) => i.customId.startsWith('track_') && i.user.id === interaction.user.id;
    const message = await interaction.fetchReply();
    const collector = message.createMessageComponentCollector({ filter, time: 30000, max: 1 });

    collector.on('collect', async (buttonInteraction) => {
        const trackIndex = parseInt(buttonInteraction.customId.split('_')[1]);
        const track = tracks[trackIndex];

        if (track) {
            await buttonInteraction.deferUpdate();
            player.queue.add(track);
            sendEmbed(buttonInteraction, "Song Added To Queue!", track);
            startPlaying(player);
        } else {
            return re(interaction, `An error occurred.`).then(() => delr(interaction, 7500));
        }
        collector.stop();
    });

    collector.on('end', () => {
        delr(interaction);
    });
}

function startPlaying(player) {
    if (player.paused) player.pause(false);
    else if (!player.playing) player.play();
}

async function sendEmbed(interaction, title, track) {
    const embed = new EmbedBuilder()
        .setAuthor({ name: title, iconURL: interaction.user.displayAvatarURL() })
        .setThumbnail(track.thumbnail ? track.thumbnail : interaction.guild.iconURL())
        .setDescription(`⌚ Queuing [**${track.title.includes(track.author) ? track.title : `${track.title} by ${track.author}`}**](${track.uri}) \`${humanizeDuration(track.duration)}\``);

    return await interaction.followUp({ content: "", embeds: [embed] }).then(m => del(m, 15000));
}

async function sendPlaylistEmbed(interaction, title, response) {
    const duration = humanizeDuration(response.tracks.reduce((acc, cur) => ({ duration: acc.duration + cur.duration })).duration);

    const embed = new EmbedBuilder()
        .setAuthor({ name: title, iconURL: interaction.user.displayAvatarURL() })
        .setThumbnail(response.tracks[0].thumbnail ? response.tracks[0].thumbnail : interaction.guild.iconURL())
        .setDescription(`⌚ Queuing  [**${response.playlist.name}**](${interaction.options.get("song").value}) \`${response.tracks.length}\` tracks \`${duration}\``);

    return await interaction.followUp({ content: "", embeds: [embed] }).then(m => del(m, 15000));
}