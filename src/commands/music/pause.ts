import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, Client, InteractionContextType } from "discord.js";
import { sendReply, deleteReply } from "../../utils/replyUtils";
import { ValidationError } from "../../utils/customErrors";

export default {
    data: new SlashCommandBuilder()
        .setName("pause")
        .setDescription("Pause the current song.")
        .setContexts(InteractionContextType.Guild),
    execute: async (interaction: ChatInputCommandInteraction, client: Client) => {
        const player = client.music.players.get(interaction.guildId!);

        if (!player || !player.current) {
            throw new ValidationError("No song(s) currently playing in this guild.");
        }

        const member = interaction.member;
        if (!member || !('voice' in member) || !member.voice.channel || member.voice.channel.id !== player.voiceChannelId) {
            throw new ValidationError("You need to be in the same voice channel as the bot to use this command.");
        }

        player.setTextChannelId(interaction.channel!.id,);
        player.pause();

        const embed = new EmbedBuilder()
            .setAuthor({ name: `Player Paused!`, iconURL: interaction.user.displayAvatarURL() })
            .setThumbnail(player.current.getThumbnailUrl() ?? interaction.guild?.iconURL() ?? null)
            .setColor("#0EFEFE")
            .setDescription(`⏸️ The player has been paused! Use \`/play\` to resume playing. ▶️`);

        await sendReply(interaction, { embeds: [embed.toJSON()] });
        await deleteReply(interaction, { timeout: 30000 });
    }
};