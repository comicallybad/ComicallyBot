import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, User } from "discord.js";
import { sendReply } from "../../utils/replyUtils";

export default {
    data: new SlashCommandBuilder()
        .setName("avatar")
        .setDescription("Responds with an embed of a users avatar.")
        .addUserOption(option => option.setName("user").setDescription("Target user")),
    execute: async (interaction: ChatInputCommandInteraction) => {
        const user: User = interaction.options.getUser("user") || interaction.user;
        const embed = new EmbedBuilder()
            .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
            .setColor("#000000")
            .setTitle(`**Avatar**`)
            .setImage(user.displayAvatarURL({ size: 4096 }));

        await sendReply(interaction, { embeds: [embed] });
    }
};