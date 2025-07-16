import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, Client, InteractionContextType } from "discord.js";
import { sendReply, deleteReply } from "../../utils/replyUtils";
import { ValidationError } from "../../utils/customErrors";
import { savePlayerState } from "../../utils/dbUtils";

export default {
    data: new SlashCommandBuilder()
        .setName("shuffle")
        .setDescription("Shuffles the current song queue.")
        .setContexts(InteractionContextType.Guild),
    execute: async (interaction: ChatInputCommandInteraction, client: Client) => {
        const player = client.music.players.get(interaction.guildId!);

        if (!player || !player.current) {
            throw new ValidationError("No song(s) currently playing in this guild.");
        }

        const member = interaction.member;
        if (!member || !('voice' in member) || !member.voice.channel || member.voice.channel.id !== player.voiceChannelId) {
            throw new ValidationError("You need to be in the voice channel to shuffle music.");
        }

        player.setTextChannelId(interaction.channel!.id);
        player.shuffle();

        const embed = new EmbedBuilder()
            .setAuthor({ name: "Queue Shuffled!", iconURL: interaction.user.displayAvatarURL() })
            .setThumbnail(player.current?.getThumbnailUrl() ?? interaction.guild?.iconURL() ?? null)
            .setColor("#0EFEFE")
            .setDescription("🔀 The song queue has been shuffled randomly!");

        await savePlayerState(player);
        await sendReply(interaction, { embeds: [embed.toJSON()] });
        await deleteReply(interaction, { timeout: 30000 });
    }
}