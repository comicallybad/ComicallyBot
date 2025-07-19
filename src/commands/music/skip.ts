import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, Client, InteractionContextType } from "discord.js";
import { Player } from "moonlink.js";
import humanizeDuration from "humanize-duration";
import { sendReply, deleteReply } from "../../utils/replyUtils";
import { savePlayerState } from "../../utils/dbUtils";
import { ValidationError } from "../../utils/customErrors";

export default {
    data: new SlashCommandBuilder()
        .setName("skip")
        .setDescription("Skips the current song.")
        .setContexts(InteractionContextType.Guild)
        .addSubcommand(command => command.setName("song").setDescription("Skip the current song in queue."))
        .addSubcommand(command => command.setName("to").setDescription("Skip to a specific time in the song.")
            .addStringOption(option => option.setName('time').setDescription('The time to skip to in the song. Examples: `1m30s`, `90s`.').setRequired(true)))
        .addSubcommand(command => command.setName("ahead").setDescription("Skip ahead in the current song.")
            .addStringOption(option => option.setName('time').setDescription('The time to skip ahead in the song. Examples: `30s`, `1m`.').setRequired(true))),
    execute: async (interaction: ChatInputCommandInteraction, client: Client) => {
        const subcommand = interaction.options.getSubcommand();
        const player = client.music.players.get(interaction.guildId!);

        if (!player || !player.current) {
            throw new ValidationError("No song(s) currently playing in this guild.");
        }

        const member = interaction.member;
        if (!member || !('voice' in member) || !member.voice.channel || member.voice.channel.id !== player.voiceChannelId) {
            throw new ValidationError("You need to be in the voice channel to use this command.");
        }

        switch (subcommand) {
            case "song":
                await skipSong(interaction, player);
                break;
            case "to":
                await skipTo(interaction, player);
                break;
            case "ahead":
                await skipAhead(interaction, player);
                break;
        }
    }
}

async function skipSong(interaction: ChatInputCommandInteraction, player: Player) {
    const channelId = interaction.channel?.id;
    if (!channelId || typeof channelId !== "string") {
        throw new ValidationError("Could not determine the text channel for this interaction.");
    }
    player.setTextChannelId(channelId);

    if (!player.queue.size) player.stop();
    else player.skip();

    const embed = new EmbedBuilder()
        .setAuthor({ name: "Song Skipped!", iconURL: interaction.user.displayAvatarURL() })
        .setColor("#0EFEFE")
        .setDescription("⏩ The current song has been skipped!");

    await sendReply(interaction, { embeds: [embed] });
    await deleteReply(interaction, { timeout: 30000 });
}

function parseTime(timeStr: string): number {
    const regex = /(\d+)(s|m|h)?/g;
    let totalSeconds = 0;
    let match;
    let lastIndex = 0;

    while ((match = regex.exec(timeStr.replace(/\s/g, ''))) !== null) {
        const value = parseInt(match[1], 10);
        const unit = match[2];

        if (unit === 's' || !unit) {
            totalSeconds += value;
        } else if (unit === 'm') {
            totalSeconds += value * 60;
        } else if (unit === 'h') {
            totalSeconds += value * 3600;
        } else {
            throw new ValidationError('Invalid time unit');
        }
        lastIndex = regex.lastIndex;
    }

    if (lastIndex !== timeStr.replace(/\s/g, '').length || totalSeconds === 0) {
        throw new ValidationError('Invalid time format');
    }

    return totalSeconds;
}

async function skipTo(interaction: ChatInputCommandInteraction, player: Player) {
    const timeStr = interaction.options.getString("time", true);
    const time = parseTime(timeStr);

    if (time <= 0) {
        throw new ValidationError("The time to skip to must be greater than 0.");
    }

    if (player.current && (time * 1000) > player.current.duration) {
        throw new ValidationError("The time to skip to cannot be greater than the song's duration.");
    }

    player.setTextChannelId(interaction.channel!.id);
    player.seek(time * 1000);

    const embed = new EmbedBuilder()
        .setAuthor({ name: "Song Time Set!", iconURL: interaction.user.displayAvatarURL() })
        .setThumbnail(player.current?.getThumbnailUrl() ?? interaction.guild?.iconURL() ?? null)
        .setColor("#0EFEFE")
        .setDescription(`⏩ The current song has been skipped to \`${humanizeDuration(time * 1000)}\`!`);

    await savePlayerState(player);
    await sendReply(interaction, { embeds: [embed] });
    await deleteReply(interaction, { timeout: 30000 });
}

async function skipAhead(interaction: ChatInputCommandInteraction, player: Player) {
    const timeStr = interaction.options.getString("time", true);
    const time = parseTime(timeStr);

    if (time <= 0) {
        throw new ValidationError("The time to skip ahead must be greater than 0.");
    }

    if (player.current && (player.current.position + (time * 1000)) > player.current.duration) {
        throw new ValidationError("Skipping ahead would exceed the song's duration.");
    }

    const position = player.current?.position + (time * 1000);
    player.setTextChannelId(interaction.channel!.id);
    player.seek(position);

    const embed = new EmbedBuilder()
        .setAuthor({ name: "Song Time Set!", iconURL: interaction.user.displayAvatarURL() })
        .setThumbnail(player.current?.getThumbnailUrl() ?? interaction.guild?.iconURL() ?? null)
        .setColor("#0EFEFE")
        .setDescription(`⏩ The current song time has been skipped \`${humanizeDuration(time * 1000)}\` to \`${humanizeDuration(position, { round: true })}\`!`);

    await savePlayerState(player);
    await sendReply(interaction, { embeds: [embed] });
    await deleteReply(interaction, { timeout: 30000 });
}