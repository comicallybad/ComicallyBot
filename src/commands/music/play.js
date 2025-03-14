const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const humanizeDuration = require("humanize-duration");
const { r, re, er, delr, del } = require("../../../utils/functions/functions.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("Resume player, or queue a song/playlist from YouTube/SoundCloud/Spotify.")
        .addStringOption(option => option.setName("song").setDescription("The song/URL you want to play.").setAutocomplete(true)),
    autocomplete: async (interaction, client) => {
        const focusedValue = interaction.options.getFocused();

        if (!focusedValue) return;

        const timeoutPromise = new Promise((resolve) => {
            setTimeout(() => {
                let truncatedValue = focusedValue.length > 100 ? focusedValue.substring(0, 97) + '...' : focusedValue;
                resolve([{ name: truncatedValue, value: truncatedValue }]);
            }, 2500);
        });

        const searchPromise = (async () => {
            let res;
            try {
                res = await client.music.search({ query: focusedValue, requester: interaction.user.id });
            } catch (error) {
                return [{ name: "An error occurred while searching", value: "error" }];
            }

            let choices = [];
            if (res.tracks) {
                choices = res.tracks.slice(0, 25).map((x, i) => {
                    let name = `${i + 1}) ${x.title}`;
                    if (name.length > 100) name = name.substring(0, 97) + '...';
                    let value = `${x.url}`;
                    if (value.length > 100) value = value.substring(0, 100);
                    return { name, value };
                });
            }

            if (res.data?.info?.name || res?.playlistInfo?.name) {
                let playlistName = `Playlist: ${res.data?.info?.name ? res.data.info.name : res.playlistInfo.name}`;
                if (playlistName.length > 100) playlistName = playlistName.substring(0, 97) + '...';
                let playlistValue = focusedValue;
                if (playlistValue.length > 100) playlistValue = playlistValue.substring(0, 97) + '...';
                choices.unshift({ name: playlistName, value: playlistValue });
            }

            if (choices.length === 0) {
                let truncatedValue = focusedValue.length > 100 ? focusedValue.substring(0, 97) + '...' : focusedValue;
                choices.push({ name: truncatedValue, value: truncatedValue });
            }

            choices = choices.slice(0, 25);
            return choices;
        })();

        const choices = await Promise.race([searchPromise, timeoutPromise]);
        return interaction.respond(choices).catch(err => err);
    },
    execute: async (interaction, client) => {
        const voiceChannel = interaction.member.voice.channel;
        const checkPlayer = client.music.players.get(interaction.guild.id);

        const checkPermsResult = await checkPerms(client, interaction, voiceChannel, checkPlayer);
        if (!checkPermsResult) return;

        const checkResumeResult = await checkResume(interaction, voiceChannel, checkPlayer);
        if (!checkResumeResult) return;

        const player = await client.music.createPlayer({
            guildId: interaction.guild.id,
            voiceChannelId: voiceChannel.id,
            textChannelId: interaction.channel.id,
            volume: 10,
            autoLeave: true
        });

        if (!player.connected) player.connect({ setDeaf: true, setMute: false });

        await re(interaction, "Loading...");
        const res = await client.music.search({ query: interaction.options.get("song").value, requester: interaction.user.id });
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
    if (!interaction.options.get("song") && checkPlayer.voiceChannelId === voiceChannel.id) {
        if (!checkPlayer.paused)
            return re(interaction, "Please provide a song name or link to search.").then(() => delr(interaction, 7500));

        checkPlayer.setTextChannelId(interaction.channel.id);
        checkPlayer.resume();

        const embed = new EmbedBuilder()
            .setAuthor({ name: `Player resumed.`, iconURL: interaction.user.displayAvatarURL() })
            .setThumbnail(checkPlayer.current ? checkPlayer.current.thumbnail : interaction.guild.iconURL())
            .setDescription(`▶️ The player has been resumed. Use \`/pause\` to pause playing again. ⏸️`);

        return r(interaction, "", embed).then(() => delr(interaction, 15000));
    } else if (!interaction.options.get("song") && checkPlayer.voiceChannelId !== voiceChannel.id) {
        checkPlayer.setTextChannelId(interaction.channel.id);
        checkPlayer.setVoiceChannelId(voiceChannel.id);
        checkPlayer.connect({ setDeaf: true, setMute: false });

        const embed = new EmbedBuilder()
            .setAuthor({ name: `Player joined.`, iconURL: interaction.user.displayAvatarURL() })
            .setThumbnail(checkPlayer.current ? checkPlayer.current.thumbnail : interaction.guild.iconURL())
            .setDescription(`▶️ The player has joined the voice channel to resume playing.`);

        return r(interaction, "", embed).then(() => delr(interaction, 15000));
    }

    return true;
}

function handleLoadType(interaction, player, res) {
    if (res.loadType === "loadfailed")
        return er(interaction, "The provided track/url could not be loaded.");
    else if (res.loadType === "empty")
        return er(interaction, "No results were found for the provided track/url.");

    if (res.loadType === "playlist") {
        delr(interaction, 0);
        sendPlaylistEmbed(interaction, "Playlist Added To Queue!", res);
        res.tracks.forEach(track => player.queue.add(track));
        startPlaying(player);
    } else {
        delr(interaction, 0);
        player.queue.add(res.tracks[0]);
        sendEmbed(interaction, "Song Added To Queue!", res.tracks[0]);
        startPlaying(player);
    }
}

function startPlaying(player) {
    if (player && !player.playing) return player.play();
    if (player && player.paused) return player.resume();
}

async function sendEmbed(interaction, title, track) {
    const embed = new EmbedBuilder()
        .setAuthor({ name: title, iconURL: interaction.user.displayAvatarURL() })
        .setThumbnail(track.thumbnail ? track.thumbnail : interaction.guild.iconURL())
        .setColor("#0EFEFE")
        .setDescription(`⌚ Queuing [**${track.title.includes(track.author) ? track.title : `${track.title} by ${track.author}`}**](${track.url}) \`${humanizeDuration(track.duration)}\``);

    return interaction.followUp({ content: "", embeds: [embed] }).then(m => del(m, 15000));
}

async function sendPlaylistEmbed(interaction, title, res) {
    const duration = humanizeDuration(res.tracks.reduce((acc, cur) => ({ duration: acc.duration + cur.duration })).duration);

    const embed = new EmbedBuilder()
        .setAuthor({ name: title, iconURL: interaction.user.displayAvatarURL() })
        .setThumbnail(res.tracks[0].thumbnail ? res.tracks[0].thumbnail : interaction.guild.iconURL())
        .setColor("#0EFEFE")
        .setDescription(`⌚ Queuing  [**${res.data?.info?.name ? res.data.info.name : res.playlistInfo.name}**](${interaction.options.get("song").value}) \`${res.tracks.length}\` tracks \`${duration}\``);

    return interaction.followUp({ content: "", embeds: [embed] }).then(m => del(m, 15000));
}