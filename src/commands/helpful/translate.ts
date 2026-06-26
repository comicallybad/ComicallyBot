import { SlashCommandBuilder, ModalBuilder, TextInputBuilder, LabelBuilder, TextInputStyle, ChatInputCommandInteraction } from "discord.js";
import { translate } from "@vitalets/google-translate-api";
import { deleteReply, sendReply } from "../../utils/replyUtils";
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
            .setPlaceholder("Enter the message to translate here.")
            .setMaxLength(1024)
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        const label = new LabelBuilder()
            .setLabel("Message To Translate")
            .setTextInputComponent(textInput);

        modal.addLabelComponents(label);

        await interaction.showModal(modal);

        const submitted = await interaction.awaitModalSubmit({
            time: 300000,
            filter: i => i.user.id === interaction.user.id && i.customId.includes(interaction.id)
        }).catch(async () => {
            await deleteReply(interaction, { timeout: 0 });
            throw new ValidationError("Modal submission timed out.");
        });

        if (!submitted || !submitted.fields) return;

        const message = submitted.fields.getTextInputValue("translate-input");

        if (subcommand === "to") {
            const res = await translate(message, { to: language });
            await sendReply(submitted, { content: `**Translation:** ${res.text} **Translated from:** \`${res.raw.src}\`` });
        } else {
            const res = await translate(message, { to: "en" });
            await sendReply(submitted, { content: `**Translation:** ${res.text} **Translated from:** \`${res.raw.src}\`` });
        }
    }
};