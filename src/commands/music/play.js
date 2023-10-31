const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const humanizeDuration = require("humanize-duration");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("Resume music or queue a song from YouTube/SoundCloud.")
        .addStringOption(option => option.setName("song")
            .setDescription("The song/URL you want to play.")),
    execute: async (client, interaction) => {
        const voiceChannel = interaction.member.voice.channel;
        const checkPlayer = client.music.players.get(interaction.guild.id);

        if (!voiceChannel)
            return interaction.reply({ content: "You must be in a voice channel to play music.", ephemeral: true })
                .then(setTimeout(() => interaction.deleteReply().catch(err => err), 7500));

        const permissions = voiceChannel.permissionsFor(client.user);

        if (!permissions.has(PermissionFlagsBits.VIEW_CHANNEL && PermissionFlagsBits.CONNECT && PermissionFlagsBits.SPEAK))
            return interaction.reply({ content: "I am missing permissions to `VIEW_CHANNEL`, `CONNECT`, or `SPEAK`!", ephemeral: true })
                .then(setTimeout(() => interaction.deleteReply().catch(err => err), 7500));

        if (!interaction.options.get("song") && !checkPlayer)
            return interaction.reply({ content: "Please provide a song name or link to search.", ephemeral: true })
                .then(setTimeout(() => interaction.deleteReply().catch(err => err), 7500));

        if (!interaction.options.get("song") && checkPlayer.voiceChannel === voiceChannel) {
            if (!checkPlayer.playing) {
                checkPlayer.pause(checkPlayer.playing).setTextChannel(interaction.channel.id);

                const embed = new EmbedBuilder()
                    .setAuthor({ name: `Player resumed.`, iconURL: interaction.user.displayAvatarURL() })
                    .setThumbnail(checkPlayer.queue.current.thumbnail)
                    .setDescription(`▶️ The player has been resumed. Use \`${prefix}pause\` to pause playing again. ⏸️`);

                return interaction.reply({ embeds: [embed] })
                    .then(setTimeout(() => interaction.deleteReply().catch(err => err), 15000));
            } else {
                return interaction.reply({ content: "Please provide a song name or link to search.", ephemeral: true })
                    .then(setTimeout(() => interaction.deleteReply().catch(err => err), 7500));
            }
        } else if (!interaction.options._hoistedOptions[0] && checkPlayer.voiceChannel !== voiceChannel) {
            checkPlayer.setTextChannel(interaction.channel.id).setVoiceChannel(voiceChannel.id);
            if (!checkPlayer.playing) {
                checkPlayer.pause(checkPlayer.playing).setTextChannel(interaction.channel.id);

                const embed = new EmbedBuilder()
                    .setAuthor({ name: `Player joined.`, iconURL: interaction.user.displayAvatarURL() })
                    .setThumbnail(checkPlayer.queue.current.thumbnail)
                    .setDescription(`▶️ The player has joined the voice channel to resume playing.`);

                return interaction.reply({ embeds: [embed] })
                    .then(setTimeout(() => interaction.deleteReply().catch(err => err), 15000));
            } else {
                return interaction.reply({ content: "Please provide a song name or link to search.", ephemeral: true })
                    .then(setTimeout(() => interaction.deleteReply().catch(err => err), 7500));
            }
        }

        const player = client.music.create({
            guild: interaction.guild.id,
            voiceChannel: voiceChannel.id,
            textChannel: interaction.channel.id,
            volume: 10,
            selfDeafen: true,
        });

        if (player.state !== "CONNECTED") {
            player.connect();
        }

        try {
            const res = await client.music.search(interaction.options.get("song").value, interaction.user);

            switch (res.loadType) {
                case "TRACK_LOADED":
                    player.queue.add(res.tracks[0]);

                    const queueEmbed = new EmbedBuilder()
                        .setAuthor({ name: "Song Added To Queue!", iconURL: interaction.user.displayAvatarURL() })
                        .setThumbnail(res.tracks[0].thumbnail)
                        .setDescription(`⌚ Queuing \`${res.tracks[0].title}\` \`${humanizeDuration(res.tracks[0].duration)}\` by: ${res.tracks[0].author}`);

                    interaction.reply({ embeds: [queueEmbed] })
                        .then(setTimeout(() => interaction.deleteReply().catch(err => err), 15000));

                    if (!player.playing) {
                        player.play();
                    }
                    break;

                case "SEARCH_RESULT":
                    let index = 1;
                    const tracks = res.tracks.slice(0, 5);
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

                    interaction.reply({ content: "", embeds: [embed], components: [row], ephemeral: true });

                    const filter = (interaction) => interaction.customId.startsWith('track_') && interaction.user.id === interaction.user.id;
                    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 30000, max: 1 });

                    collector.on('collect', (buttonInteraction) => {
                        const trackIndex = parseInt(buttonInteraction.customId.split('_')[1]);
                        const track = tracks[trackIndex];

                        if (track) {
                            player.queue.add(track);

                            const addedEmbed = new EmbedBuilder()
                                .setAuthor({ name: "Song Added To Queue!", iconURL: buttonInteraction.user.displayAvatarURL() })
                                .setThumbnail(track.thumbnail)
                                .setDescription(`⌚ Queuing \`${track.title}\` \`${humanizeDuration(track.duration)}\` by: ${track.author}`);

                            buttonInteraction.reply({ embeds: [addedEmbed] })
                                .then(setTimeout(() => buttonInteraction.deleteReply().catch(err => err), 15000));

                            if (!player.playing) player.play();
                        } else {
                            buttonInteraction.reply({ content: "There was an error queueing that track", ephemeral: true })
                                .then(setTimeout(() => buttonInteraction.deleteReply().catch(err => err), 7500));
                        }
                        collector.stop();
                    });

                    collector.on('end', () => {
                        interaction.deleteReply().catch(err => err);
                    });
                    break;

                case "PLAYLIST_LOADED":
                    res.tracks.forEach(track => player.queue.add(track));
                    const duration = humanizeDuration(res.tracks.reduce((acc, cur) => ({ duration: acc.duration + cur.duration })).duration);

                    const playlistEmbed = new EmbedBuilder()
                        .setAuthor({ name: "Playlist Added To Queue!", iconURL: interaction.user.displayAvatarURL() })
                        .setThumbnail(res.tracks[0].thumbnail)
                        .setDescription(`⌚ Queuing  \`${res.playlist.name}\` \`${res.tracks.length}\` tracks \`${duration}\``);

                    interaction.reply({ embeds: [playlistEmbed] })
                        .then(setTimeout(() => interaction.deleteReply().catch(err => err), 15000));

                    if (!player.playing) {
                        player.play();
                    }
                    break;

                default:
                    return interaction.reply({ content: "There was an error while processing your request.", ephemeral: true })
                        .then(setTimeout(() => interaction.deleteReply().catch(err => err), 7500));
            }
        } catch (error) {
            console.error(error);
        }
    }
}
