import {
    SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction,
    Client, AutocompleteInteraction, InteractionContextType
} from "discord.js";
import { Player, Track } from "moonlink.js";
import { sendReply, deleteReply } from "../../utils/replyUtils";
import { formatSongTitle } from "../../utils/stringUtils";
import { pageList } from "../../utils/paginationUtils";
import { savePlayerState } from "../../utils/dbUtils";
import { ValidationError } from "../../utils/customErrors";

export default {
    data: new SlashCommandBuilder()
        .setName("queue")
        .setDescription("Manage the current song queue.")
        .setContexts(InteractionContextType.Guild)
        .addSubcommand(subcommand => subcommand.setName('view').setDescription('Display the current song queue.'))
        .addSubcommand(subcommand => subcommand.setName('clear').setDescription('Clear the current song queue.'))
        .addSubcommand(subcommand => subcommand.setName('remove').setDescription('Removes a song or group of song from the song queue.')
            .addIntegerOption(option => option.setName('index').setDescription('The index of the song to remove from the queue.').setRequired(true).setAutocomplete(true))
            .addIntegerOption(option => option.setName('end').setDescription('The index of which songs will be removed until.').setAutocomplete(true)))
        .addSubcommand(subcommand => subcommand.setName('swap').setDescription('Swap two songs in the queue.')
            .addIntegerOption(option => option.setName('index-1').setDescription('The index of the first song to swap.').setRequired(true).setAutocomplete(true))
            .addIntegerOption(option => option.setName('index-2').setDescription('The index of the second song to swap.').setRequired(true).setAutocomplete(true))),
    autocomplete: async (interaction: AutocompleteInteraction, client: Client) => {
        const player = client.music.players.get(interaction.guildId!);
        if (!player || !player.current) return;

        const focusedValue = interaction.options.getFocused();
        let choices = player.queue.tracks.map((x: Track, i: number) => ({
            name: `${i + 1}) ${x.title}`.substring(0, 100),
            value: i + 1
        }));

        if (focusedValue) choices = choices.filter(choice => choice.name.toLowerCase().includes(focusedValue.toLowerCase()));

        if (choices.length > 25) {
            const lastChoice = choices[choices.length - 1];
            choices = choices.slice(0, 24);
            choices.push(lastChoice);
        }

        await interaction.respond(choices).catch(() => { });
    },
    execute: async (interaction: ChatInputCommandInteraction, client: Client) => {
        const subcommand = interaction.options.getSubcommand();
        const player = client.music.players.get(interaction.guildId!);

        if (!player || !player.current) {
            throw new ValidationError("No song(s) currently playing in this guild.");
        }

        switch (subcommand) {
            case 'view':
                await viewQueue(interaction, player);
                break;
            case 'clear':
                await clearQueue(interaction, player);
                break;
            case 'remove':
                await removeQueue(interaction, player);
                break;
            case 'swap':
                await swapQueue(interaction, player);
                break;
        }
    }
}

function formatQueueEntry(track: Track): string {
    const songTitle = track.title ?? "";
    const songAuthor = track.author ?? "";
    const songUrl = track.url ?? "";
    const requesterId = typeof track.requestedBy === 'object' && (track.requestedBy as any)?.id
        ? (track.requestedBy as any).id
        : track.requestedBy;
    return `${formatSongTitle(songTitle, songAuthor, songUrl)} - **Requester:** <@${requesterId}>`;
}

async function viewQueue(interaction: ChatInputCommandInteraction, player: Player) {
    const track = player.current || undefined;
    const queueTracks = player.queue.tracks;
    const queueLength = queueTracks.length;

    const embed = new EmbedBuilder()
        .setAuthor({ name: `🎧 Current Queue for ${interaction.guild?.name}`, iconURL: interaction.guild?.iconURL() || undefined })
        .setThumbnail(track?.getThumbnailUrl() ?? interaction.guild?.iconURL() ?? null)
        .setColor("#0EFEFE");

    if (!track && queueLength === 0) {
        embed.setDescription("The queue is empty.");
        await sendReply(interaction, { embeds: [embed] });
        await deleteReply(interaction, { timeout: 30000 });
        return;
    }

    let desc = "";
    if (track) {
        desc += `__**Currently Playing:**__\n${formatQueueEntry(track)}\n`;
    }
    if (queueLength > 0) {
        desc += `\n__**Rest of queue:**__\n`;
    }
    embed.setDescription(desc.trim());
    await sendReply(interaction, { embeds: [embed] });

    const queueArray = queueTracks.map(formatQueueEntry);
    await pageList(interaction, queueArray, embed, "Song #", 10, 0);
}

async function clearQueue(interaction: ChatInputCommandInteraction, player: Player) {
    player.queue.clear();

    const embed = new EmbedBuilder()
        .setAuthor({ name: `🎧 Queue Cleared for ${interaction.guild?.name}`, iconURL: interaction.guild?.iconURL() || undefined })
        .setThumbnail(player.current?.getThumbnailUrl() ?? interaction.guild?.iconURL() ?? null)
        .setColor("#FF0000")
        .setDescription("The queue has been cleared.");

    await savePlayerState(player);
    await sendReply(interaction, { embeds: [embed] });
    await deleteReply(interaction, { timeout: 30000 });
}

async function removeQueue(interaction: ChatInputCommandInteraction, player: Player) {
    const index = interaction.options.getInteger('index', true);
    const end = interaction.options.getInteger('end');
    let text;

    if (index < 1 || index > player.queue.size) {
        throw new ValidationError("Please provide a valid index for the current queue.");
    }

    if (end && index > end) {
        throw new ValidationError("The start index must be smaller than the end index.");
    }

    if (end && index !== end) {
        const actualEnd = Math.min(end, player.queue.size);
        text = `Songs **${index}-${actualEnd}** have`;
        player.queue.removeRange(index - 1, actualEnd - 1);
    } else {
        text = `**${player.queue.tracks[index - 1]?.title ?? "Unknown Song"}** has`;
        player.queue.remove(index - 1);
    }

    const embed = new EmbedBuilder()
        .setAuthor({ name: `🎧 Queue Edited for ${interaction.guild?.name}`, iconURL: interaction.guild?.iconURL() || undefined })
        .setThumbnail(player.current?.getThumbnailUrl() ?? interaction.guild?.iconURL() ?? null)
        .setColor("#FF0000")
        .setDescription(`${text} been removed from the queue.`)

    await savePlayerState(player);
    await sendReply(interaction, { embeds: [embed] });
    await deleteReply(interaction, { timeout: 30000 });
}

async function swapQueue(interaction: ChatInputCommandInteraction, player: Player) {
    const index1 = interaction.options.getInteger('index-1', true) - 1;
    const index2 = interaction.options.getInteger('index-2', true) - 1;

    if (index1 < 0 || index1 >= player.queue.size || index2 < 0 || index2 >= player.queue.size) {
        throw new ValidationError("Please provide a valid index for the current queue.");
    }

    player.queue.moveRange(index1, index2, 1);

    const embed = new EmbedBuilder()
        .setAuthor({ name: `🎧 Queue Edited for ${interaction.guild?.name}`, iconURL: interaction.guild?.iconURL() || undefined })
        .setThumbnail(player.current?.getThumbnailUrl() ?? interaction.guild?.iconURL() ?? null)
        .setColor("#0EFEFE")
        .setDescription(`Songs **${index1 + 1}** and **${index2 + 1}** have been swapped in the queue.`)

    await sendReply(interaction, { embeds: [embed] });
    await deleteReply(interaction, { timeout: 30000 });
}