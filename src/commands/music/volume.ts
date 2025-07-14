import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, Client, InteractionContextType } from "discord.js";
import { sendReply, deleteReply } from "../../utils/replyUtils";
import { ValidationError } from "../../utils/customErrors";

export default {
    data: new SlashCommandBuilder()
        .setName("volume")
        .setDescription("Changes the volume of the music player.")
        .setContexts(InteractionContextType.Guild)
        .addIntegerOption(option => option.setName("input").setDescription("The volume percentage input.").setRequired(true)),
    execute: async (interaction: ChatInputCommandInteraction, client: Client) => {
        const volume = interaction.options.getInteger("input", true);
        const player = client.music.players.get(interaction.guildId!);

        if (!player || !player.current) {
            throw new ValidationError("No song(s) currently playing in this guild.");
        }

        const member = interaction.member;
        if (!member || !('voice' in member) || !member.voice.channel || member.voice.channel.id !== player.voiceChannelId) {
            throw new ValidationError("You need to be in the same voice channel as the bot to use this command.");
        }

        if (volume <= 0 || volume > 100) {
            throw new ValidationError("You may only set the volume to 1-100.");
        }

        player.setVolume(volume);

        const vol = volume / 10;
        const volFloor = Math.floor(volume / 10);
        const volLevel = vol > volFloor ? `${"🔊".repeat(volFloor)} 🔉 ${"🔈".repeat(10 - vol)}` : `${"🔊".repeat(volFloor)} ${"🔈".repeat(10 - vol)}`;

        const embed = new EmbedBuilder()
            .setAuthor({ name: `Volume Changed!`, iconURL: interaction.user.displayAvatarURL() })
            .setThumbnail(player.current.getThumbnailUrl() ?? interaction.guild?.iconURL() ?? null)
            .setColor("#0EFEFE")
            .setDescription(`The volume has been set to: **${volume}%** ${volLevel}`);

        await sendReply(interaction, { embeds: [embed.toJSON()] });
        await deleteReply(interaction, { timeout: 30000 });
    }
};