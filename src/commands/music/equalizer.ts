import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, Client, InteractionContextType } from "discord.js";
import { Player } from "moonlink.js";
import { sendReply, deleteReply } from "../../utils/replyUtils";
import { ValidationError } from "../../utils/customErrors";

const intensityChoices: Array<{ name: string, value: number }> = [
    { name: "Light (0.5x)", value: 0.5 },
    { name: "Moderate (1.0x)", value: 1.0 },
    { name: "Heavy (1.5x)", value: 1.5 },
];

const quarterChoices: Array<{ name: string, value: number }> = [];
for (let i = 1; i <= 8; i++) {
    const value = Number((0.25 * i).toFixed(2));
    quarterChoices.push({ name: value.toFixed(2), value });
}

const tenthsChoices: Array<{ name: string, value: number }> = [];
for (let i = 1; i <= 10; i++) {
    const value = Number((0.1 * i).toFixed(1));
    tenthsChoices.push({ name: value.toFixed(1), value });
}

const rotationChoices: Array<{ name: string, value: number }> = [];
for (let i = -8; i <= 8; i++) {
    const value = Number((0.25 * i).toFixed(2));
    rotationChoices.push({ name: value.toFixed(2), value });
}

export default {
    data: new SlashCommandBuilder()
        .setName("eq")
        .setDescription("Adjusts the music equalizer.")
        .setContexts(InteractionContextType.Guild)
        .addSubcommand(command => command.setName("bass").setDescription("Boosts the bass.")
            .addNumberOption(option => option.setName("intensity").setDescription("The intensity of the bass boost.")
                .addChoices(...intensityChoices).setRequired(false)))
        .addSubcommand(command => command.setName("high").setDescription("Boosts the high frequencies.")
            .addNumberOption(option => option.setName("intensity").setDescription("The intensity of the high frequency boost.")
                .addChoices(...intensityChoices).setRequired(false)))
        .addSubcommand(command => command.setName("band").setDescription("Sets the equalizer to band-pass.")
            .addNumberOption(option => option.setName("intensity").setDescription("The intensity of the band-pass effect.")
                .addChoices(...intensityChoices).setRequired(false)))
        .addSubcommand(command => command.setName("timescale").setDescription("Adjusts the speed, pitch, and rate of the song.")
            .addNumberOption(option => option.setName("speed").setDescription("The speed multiplier.")
                .addChoices(...quarterChoices).setRequired(false))
            .addNumberOption(option => option.setName("pitch").setDescription("The pitch multiplier.")
                .addChoices(...quarterChoices).setRequired(false))
            .addNumberOption(option => option.setName("rate").setDescription("The rate multiplier.")
                .addChoices(...quarterChoices).setRequired(false)))
        .addSubcommand(command => command.setName("karaoke").setDescription("Applies a karaoke filter.")
            .addNumberOption(option => option.setName("level").setDescription("The level of the karaoke effect (0-1).")
                .addChoices(...tenthsChoices).setRequired(false)))
        .addSubcommand(command => command.setName("tremolo").setDescription("Applies a tremolo filter.")
            .addNumberOption(option => option.setName("frequency").setDescription("The frequency of the tremolo (Hz).")
                .addChoices(...quarterChoices).setRequired(false))
            .addNumberOption(option => option.setName("depth").setDescription("The depth of the tremolo (0-1).")
                .addChoices(...tenthsChoices).setRequired(false)))
        .addSubcommand(command => command.setName("vibrato").setDescription("Applies a vibrato filter.")
            .addNumberOption(option => option.setName("frequency").setDescription("The frequency of the vibrato (Hz).")
                .addChoices(...quarterChoices).setRequired(false))
            .addNumberOption(option => option.setName("depth").setDescription("The depth of the vibrato (0-1).")
                .addChoices(...tenthsChoices).setRequired(false)))
        .addSubcommand(command => command.setName("rotation").setDescription("Applies a rotation filter.")
            .addNumberOption(option => option.setName("rotationhz").setDescription("The frequency of the audio rotating around the listener (Hz).")
                .addChoices(...rotationChoices).setRequired(false)))
        .addSubcommand(command => command.setName("distortion").setDescription("Applies a distortion filter.")
            .addNumberOption(option => option.setName("sinoffset").setDescription("The sine offset (e.g., 0.5).")
                .addChoices(...quarterChoices).setRequired(false))
            .addNumberOption(option => option.setName("sinscale").setDescription("The sine scale (e.g., 0.5).")
                .addChoices(...quarterChoices).setRequired(false)))
        .addSubcommand(command => command.setName("reset").setDescription("Resets all filters.")),
    execute: async (interaction: ChatInputCommandInteraction, client: Client) => {
        const subcommand = interaction.options.getSubcommand();
        const player = client.music.players.get(interaction.guildId!);

        if (!player || !player.current) {
            throw new ValidationError("No song(s) currently playing in this guild.");
        }

        const member = interaction.member;
        if (!member || !('voice' in member) || !member.voice.channel || member.voice.channel.id !== player.voiceChannelId) {
            throw new ValidationError("You need to be in the voice channel to adjust the equalizer.");
        }

        switch (subcommand) {
            case "bass":
                await bassEQ(interaction, player);
                break;
            case "high":
                await highEQ(interaction, player);
                break;
            case "band":
                await bandEQ(interaction, player);
                break;
            case "timescale":
                await timescaleEQ(interaction, player);
                break;
            case "karaoke":
                await karaokeFilter(interaction, player);
                break;
            case "tremolo":
                await tremoloFilter(interaction, player);
                break;
            case "vibrato":
                await vibratoFilter(interaction, player);
                break;
            case "rotation":
                await rotationFilter(interaction, player);
                break;
            case "distortion":
                await distortionFilter(interaction, player);
                break;
            case "reset":
                await resetFilters(interaction, player);
                break;
        }
    }
}

async function bassEQ(interaction: ChatInputCommandInteraction, player: Player) {
    const intensity = interaction.options.getNumber("intensity") ?? 0.5;

    player.filters.setEqualizer([
        { band: 0, gain: 0.15 * intensity },
        { band: 1, gain: 0.2 * intensity },
        { band: 2, gain: 0.2 * intensity },
        { band: 3, gain: 0 * intensity },
        { band: 4, gain: -0.1 * intensity },
        { band: 5, gain: 0.05 * intensity }
    ]);

    await sendFilterReply(interaction, player, `Equalizer Set To Bass Boosted.`, `The equalizer has been set to **bass boosted** with intensity **${intensity}**.`);
}

async function highEQ(interaction: ChatInputCommandInteraction, player: Player) {
    const intensity = interaction.options.getNumber("intensity") ?? 0.5;

    player.filters.setEqualizer([
        { band: 0, gain: -0.15 * intensity },
        { band: 1, gain: 0 * intensity },
        { band: 2, gain: 0 * intensity },
        { band: 3, gain: 0.15 * intensity },
        { band: 4, gain: 0.25 * intensity },
        { band: 5, gain: 0.25 * intensity }
    ]);

    await sendFilterReply(interaction, player, `Equalizer Set To High Pass.`, `The equalizer has been set to **high pass** with intensity **${intensity}**.`);
}

async function bandEQ(interaction: ChatInputCommandInteraction, player: Player) {
    const intensity = interaction.options.getNumber("intensity") ?? 0.5;

    player.filters.setEqualizer([
        { band: 0, gain: -0.15 * intensity },
        { band: 1, gain: 0.15 * intensity },
        { band: 2, gain: 0.15 * intensity },
        { band: 3, gain: 0.15 * intensity },
        { band: 4, gain: -0.15 * intensity },
        { band: 5, gain: -0.15 * intensity }
    ]);

    await sendFilterReply(interaction, player, `Equalizer Set To Band Pass.`, `The equalizer has been set to **band pass** with intensity **${intensity}**.`);
}

async function timescaleEQ(interaction: ChatInputCommandInteraction, player: Player) {
    const speed = interaction.options.getNumber("speed") ?? undefined;
    const pitch = interaction.options.getNumber("pitch") ?? undefined;
    const rate = interaction.options.getNumber("rate") ?? undefined;

    player.filters.setTimescale({
        speed: speed,
        pitch: pitch,
        rate: rate,
    });

    await sendFilterReply(interaction, player, `Timescale Adjusted!`, `The timescale has been adjusted with speed: **${speed ?? "default"}**, pitch: **${pitch ?? "default"}**, and rate: **${rate ?? "default"}**.`);
}

async function karaokeFilter(interaction: ChatInputCommandInteraction, player: Player) {
    const level = interaction.options.getNumber("level") ?? undefined;

    player.filters.setKaraoke({
        level: level,
    });

    await sendFilterReply(interaction, player, `Karaoke Filter Applied!`, `Karaoke filter has been applied with level: **${level ?? "default"}**.`);
}

async function tremoloFilter(interaction: ChatInputCommandInteraction, player: Player) {
    const frequency = interaction.options.getNumber("frequency") ?? undefined;
    const depth = interaction.options.getNumber("depth") ?? 0.0;

    player.filters.setTremolo({
        frequency: frequency,
        depth: depth,
    });

    await sendFilterReply(interaction, player, `Tremolo Filter Applied!`, `Tremolo filter has been applied with frequency: **${frequency ?? "default"}** and depth: **${depth}**.`);
}

async function vibratoFilter(interaction: ChatInputCommandInteraction, player: Player) {
    const frequency = interaction.options.getNumber("frequency") ?? undefined;
    const depth = interaction.options.getNumber("depth") ?? 0.0;

    player.filters.setVibrato({
        frequency: frequency,
        depth: depth,
    });

    await sendFilterReply(interaction, player, `Vibrato Filter Applied!`, `Vibrato filter has been applied with frequency: **${frequency ?? "default"}** and depth: **${depth}**.`);
}

async function rotationFilter(interaction: ChatInputCommandInteraction, player: Player) {
    const rotationHz = interaction.options.getNumber("rotationhz") ?? undefined;

    player.filters.setRotation({
        rotationHz: rotationHz,
    });

    await sendFilterReply(interaction, player, `Rotation Filter Applied!`, `Rotation filter has been applied with rotationHz: **${rotationHz ?? "default"}**.`);
}

async function distortionFilter(interaction: ChatInputCommandInteraction, player: Player) {
    const sinOffset = interaction.options.getNumber("sinoffset") ?? undefined;
    const sinScale = interaction.options.getNumber("sinscale") ?? undefined;

    player.filters.setDistortion({
        sinOffset: sinOffset,
        sinScale: sinScale,
    });

    await sendFilterReply(interaction, player, `Distortion Filter Applied!`, `Distortion filter has been applied with sinOffset: **${sinOffset ?? "default"}** and sinScale: **${sinScale ?? "default"}**.`);
}

async function resetFilters(interaction: ChatInputCommandInteraction, player: Player) {
    player.filters.resetFilters();

    await sendFilterReply(interaction, player, `All Filters Reset!`, `All filters have been reset to their default values.`);
}

async function sendFilterReply(interaction: ChatInputCommandInteraction, player: Player, title: string, description: string) {
    const embed = new EmbedBuilder()
        .setAuthor({ name: title, iconURL: interaction.user.displayAvatarURL() })
        .setThumbnail(player.current.getThumbnailUrl() ?? interaction.guild?.iconURL() ?? null)
        .setDescription(description);

    await sendReply(interaction, { embeds: [embed.toJSON()] });
    await deleteReply(interaction, { timeout: 30000 });
}