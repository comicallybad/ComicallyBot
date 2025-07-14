import {
    SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ModalBuilder, TextInputBuilder,
    TextInputStyle, ChatInputCommandInteraction, TextChannel, ModalSubmitInteraction
} from "discord.js";
import { sendReply, deleteReply } from "../../utils/replyUtils";
import { sendMessage } from "../../utils/messageUtils";
import { ValidationError } from "../../utils/customErrors";

export default {
    data: new SlashCommandBuilder()
        .setName("announce")
        .setDescription("Make an announcement to a channel.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addChannelOption(option => option.setName("channel").setDescription("The channel to send the announcement to.").addChannelTypes(0)),
    execute: async (interaction: ChatInputCommandInteraction) => {
        const channel = interaction.options.getChannel("channel") as TextChannel || interaction.channel as TextChannel;

        const modal = new ModalBuilder()
            .setCustomId(`announcement-${interaction.id}`)
            .setTitle("Announcement Message");

        const textInput = new TextInputBuilder()
            .setCustomId("announcement-input")
            .setLabel("Announcement Message")
            .setPlaceholder("Enter the announcement message here.")
            .setMaxLength(2000)
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        const actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(textInput);
        modal.addComponents(actionRow);

        await interaction.showModal(modal);

        const submitted = await interaction.awaitModalSubmit({
            time: 30000,
            filter: i => i.user.id === interaction.user.id && i.customId.includes(interaction.id)
        }).catch(() => { throw new ValidationError("Modal submission timed out."); });

        if (!submitted || !submitted.fields) return;

        const announcement = submitted.fields.getTextInputValue("announcement-input");
        await sendReply(submitted as ModalSubmitInteraction, { content: "Announcement sent." });
        await deleteReply(submitted as ModalSubmitInteraction, { timeout: 30000 });
        await sendMessage(channel, { content: announcement });
        return;
    }
};