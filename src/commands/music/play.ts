import {
    SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChatInputCommandInteraction,
    Client, AutocompleteInteraction, InteractionContextType
} from "discord.js";
import humanizeDuration from "humanize-duration";
import { sendReply, deleteReply, editReply } from "../../utils/replyUtils";
import { formatSongTitle } from "../../utils/stringUtils";
import { Player, SearchResult, Track } from "moonlink.js";
import { PermissionError, ValidationError } from "../../utils/customErrors";
import { savePlayerState } from "../../utils/dbUtils";

export default {
    data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("Resume player, or queue a song/playlist from YouTube/SoundCloud/Spotify.")
        .setContexts(InteractionContextType.Guild)
        .addStringOption(option => option.setName("song").setDescription("The song/URL you want to play.").setAutocomplete(true)),
    autocomplete: async (interaction: AutocompleteInteraction, client: Client) => {
        const focusedValue = interaction.options.getFocused();

        if (!focusedValue) return;

        const timeoutPromise = new Promise<any[]>((resolve) => {
            setTimeout(() => {
                let truncatedValue = focusedValue.length > 100 ? focusedValue.substring(0, 97) + '...' : focusedValue;
                resolve([{ name: truncatedValue, value: truncatedValue }]);
            }, 2500);
        });

        const searchPromise = (async (): Promise<any[]> => {
            let res: any;
            try {
                res = await client.music.search({ query: focusedValue, requester: interaction.user.id });
            } catch (error: unknown) {
                throw error;
            }

            let choices: { name: string, value: string }[] = [];
            if (res.tracks) {
                choices = res.tracks.slice(0, 25).map((x: any, i: number) => {
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
        await interaction.respond(choices).catch(() => { });
    },
    execute: async (interaction: ChatInputCommandInteraction, client: Client) => {
        const member = interaction.member;
        if (!member || !('voice' in member) || !member.voice.channel) {
            throw new ValidationError("You must be in a voice channel to use this command.");
        }
        const voiceChannel = member.voice.channel;

        const permissions = voiceChannel.permissionsFor(client.user!);
        if (!permissions || !permissions.has(PermissionFlagsBits.ViewChannel) || !permissions.has(PermissionFlagsBits.Connect) || !permissions.has(PermissionFlagsBits.Speak)) {
            throw new PermissionError("I am missing the `View Channel`, `Connect`, or `Speak` permissions for that voice channel.");
        }

        const songOption = interaction.options.get("song");
        const checkPlayer = client.music.players.get(interaction.guildId!);

        if (!songOption) {
            const handled = await handleNoSongOption(interaction, client, voiceChannel, checkPlayer);
            if (handled) return;
        }

        const player = client.music.createPlayer({
            guildId: interaction.guild!.id,
            voiceChannelId: voiceChannel.id,
            textChannelId: interaction.channel!.id,
            volume: 10,
            autoLeave: true
        });

        if (!player.connected) player.connect({ setDeaf: true, setMute: false });

        await sendReply(interaction, { content: "Loading..." });
        const res = await client.music.search({ query: songOption?.value as string, requester: interaction.user.id });
        await handleLoadType(interaction, player, res);
        await deleteReply(interaction, { timeout: 15000 });
    }
}

async function handleNoSongOption(interaction: ChatInputCommandInteraction, client: Client, voiceChannel: any, checkPlayer: Player): Promise<boolean> {
    if (checkPlayer) {
        if (checkPlayer.voiceChannelId === voiceChannel.id) {
            if (checkPlayer.paused) {
                checkPlayer.setTextChannelId(interaction.channel!.id);
                checkPlayer.resume();
                await savePlayerState(checkPlayer);

                const embed = new EmbedBuilder()
                    .setAuthor({ name: `Player resumed.`, iconURL: interaction.user.displayAvatarURL() })
                    .setThumbnail(checkPlayer.current?.getThumbnailUrl() ?? interaction.guild?.iconURL() ?? null)
                    .setDescription(`▶️ The player has been resumed. Use \`/pause\` to pause playing again. ⏸️`);

                await sendReply(interaction, { embeds: [embed.toJSON()] });
                await deleteReply(interaction, { timeout: 15000 });
                return true;
            } else {
                throw new ValidationError("Music is already playing in this channel.");
            }
        } else {
            checkPlayer.setTextChannelId(interaction.channel!.id);
            checkPlayer.setVoiceChannelId(voiceChannel.id);
            checkPlayer.connect({ setDeaf: true, setMute: false });
            await savePlayerState(checkPlayer);

            const embed = new EmbedBuilder()
                .setAuthor({ name: `Player joined.`, iconURL: interaction.user.displayAvatarURL() })
                .setThumbnail(checkPlayer.current?.thumbnail ?? interaction.guild?.iconURL() ?? null)
                .setDescription(`▶️ The player has joined the voice channel to resume playing.`);

            await sendReply(interaction, { embeds: [embed.toJSON()] });
            await deleteReply(interaction, { timeout: 15000 });
            return true;
        }
    } else {
        throw new ValidationError("Please provide a song name or link to search.");
    }
}

async function handleLoadType(interaction: ChatInputCommandInteraction, player: Player, res: SearchResult) {
    if (res.loadType === "error") {
        throw new ValidationError("The provided track/url could not be loaded.");
    } else if (res.loadType === "empty") {
        throw new ValidationError("No results were found for the provided track/url.");
    }

    if (res.loadType === "playlist") {
        player.queue.add(res.tracks);
        await sendPlaylistEmbed(interaction, "Playlist Added To Queue!", res);
        startPlaying(player);
        await savePlayerState(player);
    } else {
        player.queue.add(res.tracks[0]);
        await sendEmbed(interaction, "Song Added To Queue!", res.tracks[0]);
        startPlaying(player);
        await savePlayerState(player);
    }
}

function startPlaying(player: Player) {
    if (player && !player.playing) return player.play();
    if (player && player.paused) return player.resume();
}

async function sendEmbed(interaction: ChatInputCommandInteraction, title: string, track: Track) {
    const songTitle = track.title ?? "";
    const songAuthor = track.author ?? "";
    const songUrl = track.url ?? "";

    const embed = new EmbedBuilder()
        .setAuthor({ name: title, iconURL: interaction.user.displayAvatarURL() })
        .setThumbnail(track.getThumbnailUrl() ?? interaction.guild?.iconURL() ?? null)
        .setColor("#0EFEFE")
        .setDescription(`⌚ Queuing ${formatSongTitle(songTitle, songAuthor, songUrl)} \`${humanizeDuration(track.duration)}\``);

    try {
        await editReply(interaction, { content: "", embeds: [embed.toJSON()] });
    } catch (error: unknown) {
        return;
    }
}

async function sendPlaylistEmbed(interaction: ChatInputCommandInteraction, title: string, res: SearchResult) {
    const duration = humanizeDuration(res.getTotalDuration());

    const embed = new EmbedBuilder()
        .setAuthor({ name: title, iconURL: interaction.user.displayAvatarURL() })
        .setThumbnail(res.tracks[0]?.getThumbnailUrl() ?? interaction.guild?.iconURL() ?? null)
        .setColor("#0EFEFE")
        .setDescription(`⌚ Queuing  [**${res.playlistInfo.name}**](${interaction.options.get("song")?.value as string}) ${res.tracks.length} tracks \`${duration}\``);

    try {
        await editReply(interaction, { content: "", embeds: [embed.toJSON()] });
    } catch (error: unknown) {
        return;
    }
}