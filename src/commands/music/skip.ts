import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, Client, InteractionContextType } from "discord.js";
import { Player } from "moonlink.js";
import humanizeDuration from "humanize-duration";
import { sendReply, deleteReply } from "../../utils/replyUtils";
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

    await sendReply(interaction, { embeds: [embed.toJSON()] });
    await deleteReply(interaction, { timeout: 30000 });
}

function parseTime(timeStr: string): number {
    const match = timeStr.replace(/\s/g, '').match(/(\d+)(s|sec|secs|second|seconds|m|min|mins|minute|minutes|h|hour|hours)?/g);
    if (!match) {
        throw new ValidationError('Invalid time format');
    }
    let time = 0;
    match.forEach((part) => {
        const partMatch = part.match(/(\d+)(s|sec|secs|second|seconds|m|min|mins|minute|minutes|h|hour|hours)?/);
        if (!partMatch) {
            throw new ValidationError('Invalid time format');
        }
        const partTime = parseInt(partMatch[1], 10);
        const unit = partMatch[2];
        if (!unit || unit.startsWith('s')) {
            time += partTime;
        } else if (unit.startsWith('m')) {
            time += partTime * 60;
        } else if (unit.startsWith('h')) {
            time += partTime * 3600;
        } else {
            throw new ValidationError('Invalid time unit');
        }
    });
    return time;
}

async function skipTo(interaction: ChatInputCommandInteraction, player: Player) {
    const timeStr = interaction.options.getString("time", true);
    let time;
    try {
        time = parseTime(timeStr);
    } catch (error: unknown) {
        throw error;
    }

    player.setTextChannelId(interaction.channel!.id);
    player.seek(time * 1000);

    const embed = new EmbedBuilder()
        .setAuthor({ name: "Song Time Set!", iconURL: interaction.user.displayAvatarURL() })
        .setThumbnail(player.current?.getThumbnailUrl() ?? interaction.guild?.iconURL() ?? null)
        .setColor("#0EFEFE")
        .setDescription(`⏩ The current song has been skipped to \`${humanizeDuration(time * 1000)}\`!`);

    await sendReply(interaction, { embeds: [embed.toJSON()] });
    await deleteReply(interaction, { timeout: 30000 });
}

async function skipAhead(interaction: ChatInputCommandInteraction, player: Player) {
    const timeStr = interaction.options.getString("time", true);
    let time;
    try {
        time = parseTime(timeStr);
    } catch (error: unknown) {
        throw error;
    }

    const position = player.current.position + (time * 1000);
    player.setTextChannelId(interaction.channel!.id);
    player.seek(position);

    const embed = new EmbedBuilder()
        .setAuthor({ name: "Song Time Set!", iconURL: interaction.user.displayAvatarURL() })
        .setThumbnail(player.current?.getThumbnailUrl() ?? interaction.guild?.iconURL() ?? null)
        .setColor("#0EFEFE")
        .setDescription(`⏩ The current song time has been skipped \`${humanizeDuration(time * 1000)}\` to \`${humanizeDuration(Math.floor(position))}\`!`);

    await sendReply(interaction, { embeds: [embed.toJSON()] });
    await deleteReply(interaction, { timeout: 30000 });
}