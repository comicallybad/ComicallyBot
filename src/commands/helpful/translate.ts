import {
    SlashCommandBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder,
    TextInputStyle, ChatInputCommandInteraction, ModalSubmitInteraction
} from "discord.js";
import { sendReply } from "../../utils/replyUtils";
import { translate } from "@vitalets/google-translate-api";
import { ValidationError } from "../../utils/customErrors";

export default {
    data: new SlashCommandBuilder()
        .setName("translate")
        .setDescription("Translates a message for you.")
        .addSubcommand(subcommand => subcommand.setName("to").setDescription("Translates a message to a specified language.")
            .addStringOption(option => option.setName("language").setDescription("Language code").setRequired(true)))
        .addSubcommand(subcommand => subcommand.setName("default").setDescription("Translates a message to English.")),
    execute: async (interaction: ChatInputCommandInteraction) => {
        const subcommand = interaction.options.getSubcommand(false);
        const language = interaction.options.getString("language") || undefined;

        if (subcommand === "to" && !language) {
            throw new ValidationError("You must provide a language code to translate to.");
        }

        const modal = new ModalBuilder()
            .setCustomId(`translate-${interaction.id}`)
            .setTitle("Message To Translate");

        const textInput = new TextInputBuilder()
            .setCustomId("translate-input")
            .setLabel("Message To Translate")
            .setPlaceholder("Enter the message to translate here.")
            .setMaxLength(1024)
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

        const message = submitted.fields.getTextInputValue("translate-input");

        try {
            if (subcommand === "to") {
                const res = await translate(message, { to: language });
                await sendReply(submitted as ModalSubmitInteraction, { content: `**Translation:** ${res.text} **Translated from:** \`${res.raw.src}\`` });
            } else {
                const res = await translate(message, { to: "en" });
                await sendReply(submitted as ModalSubmitInteraction, { content: `**Translation:** ${res.text} **Translated from:** \`${res.raw.src}\`` });
            }
        } catch (error: unknown) {
            throw error;
        }
    }
};