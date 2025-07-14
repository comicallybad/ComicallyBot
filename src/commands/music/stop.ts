import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, Client, InteractionContextType } from "discord.js";
import { sendReply, deleteReply } from "../../utils/replyUtils";
import { ValidationError } from "../../utils/customErrors";

export default {
    data: new SlashCommandBuilder()
        .setName("stop")
        .setDescription("Disconnects the bot from the voice channel.")
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

        player.destroy();

        const embed = new EmbedBuilder()
            .setAuthor({ name: "Music Player Disconnected!", iconURL: interaction.user.displayAvatarURL() })
            .setColor("#FF0000")
            .setDescription("🛑 The music player has successfully been disconnected!");

        await sendReply(interaction, { embeds: [embed.toJSON()] });
        await deleteReply(interaction, { timeout: 30000 });
    },
};