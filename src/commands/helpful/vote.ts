import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, GuildMember } from "discord.js";
import { sendReply } from "../../utils/replyUtils";

export default {
    data: new SlashCommandBuilder()
        .setName("vote")
        .setDescription("Sends a message users can vote on.")
        .addStringOption(option => option.setName("input").setDescription("What will be voted on").setMaxLength(1024).setRequired(true)),
    execute: async (interaction: ChatInputCommandInteraction) => {
        const input: string = interaction.options.getString("input", true);
        const member = interaction.member as GuildMember;

        const embed = new EmbedBuilder()
            .setColor("#0efefe")
            .setAuthor({ name: `${member.displayName}`, iconURL: interaction.user.displayAvatarURL() })
            .setDescription(`${input}`)
            .setFooter({ text: `Select a reaction below to vote on` })
            .setTimestamp();

        await sendReply(interaction, { embeds: [embed.toJSON()] });
        const message = await interaction.fetchReply();
        await message.react("⬆️");
        await message.react("⬇️");
    }
};