import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, Client, InteractionContextType } from "discord.js";
import { Player } from "moonlink.js";
import { sendReply, deleteReply } from "../../utils/replyUtils";
import { ValidationError } from "../../utils/customErrors";

export default {
    data: new SlashCommandBuilder()
        .setName("repeat")
        .setDescription("Repeats the current track or entire song queue.")
        .setContexts(InteractionContextType.Guild)
        .addSubcommand(command => command.setName("track").setDescription("Repeat current track."))
        .addSubcommand(command => command.setName("queue").setDescription("Repeat entire queue.")),
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

        player.setTextChannelId(interaction.channel!.id);

        switch (subcommand) {
            case "track":
                await trackRepeat(interaction, player);
                break;
            case "queue":
                await queueRepeat(interaction, player);
                break;
        }
    }
}

async function trackRepeat(interaction: ChatInputCommandInteraction, player: Player) {
    if (player.loop !== "off" && player.loop !== "queue") player.setLoop("off");
    else player.setLoop("track");

    const embed = new EmbedBuilder()
        .setAuthor({ name: `Track Repeat: ${player.loop !== "off" ? "ON" : "OFF"}!`, iconURL: interaction.user.displayAvatarURL() })
        .setThumbnail(player.current?.getThumbnailUrl() ?? interaction.guild?.iconURL() ?? null)
        .setColor("#0EFEFE")
        .setDescription(`Track repeat has been toggled ${player.loop !== "off" ? "**ON**\n(The current track will now repeat) 🔁" : "**OFF**\n(The current track will no longer repeat) ❌🔁"}`);

    await sendReply(interaction, { embeds: [embed.toJSON()] });
    await deleteReply(interaction, { timeout: 30000 });
}

async function queueRepeat(interaction: ChatInputCommandInteraction, player: Player) {
    if (player.loop !== "off" && player.loop !== "track") player.setLoop("off");
    else player.setLoop("queue");

    const embed = new EmbedBuilder()
        .setAuthor({ name: `Queue Repeat: ${player.loop !== "off" ? "ON" : "OFF"}!`, iconURL: interaction.user.displayAvatarURL() })
        .setThumbnail(player.current?.getThumbnailUrl() ?? interaction.guild?.iconURL() ?? null)
        .setColor("#0EFEFE")
        .setDescription(`The player queue repeat has been toggled ${player.loop !== "off" ? "**ON**\n(The queue will now repeat) 🔁" : "**OFF**\n(The queue will no longer repeat) ❌🔁"}`);

    await sendReply(interaction, { embeds: [embed.toJSON()] });
    await deleteReply(interaction, { timeout: 30000 });
}