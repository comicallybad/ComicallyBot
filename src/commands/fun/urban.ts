import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from "discord.js";
import { deleteReply, sendReply } from "../../utils/replyUtils";
import { escapeMarkdown } from "../../utils/stringUtils";
import urban from "relevant-urban";
import { ValidationError } from "../../utils/customErrors";

export default {
    data: new SlashCommandBuilder()
        .setName("urban")
        .setDescription("Gets an urban dictionary definition")
        .addSubcommand(subcommand => subcommand.setName("search").setDescription("Searches for a term")
            .addStringOption(option => option.setName("term").setDescription("Search term").setRequired(true)))
        .addSubcommand(subcommand => subcommand.setName("random").setDescription("Gets a random definition")),
    async execute(interaction: ChatInputCommandInteraction) {
        const subcommand = interaction.options.getSubcommand();
        let res;

        if (subcommand === "search") {
            const term = interaction.options.getString("term", true);
            res = await urban(term);
        } else if (subcommand === "random") {
            res = await urban.random();
        }

        if (!res) {
            throw new ValidationError("No definition found for that term.");
        }

        const { word, definition, example, thumbsUp, thumbsDown, urbanURL, author } = res;

        const escapedExample = escapeMarkdown(example || "No Example");
        const escapedDefinition = escapeMarkdown(definition);

        const baseMessage = `**Example:** ${escapedExample}\n` +
            `**Upvotes:** ${thumbsUp || 0}\n` +
            `**Downvotes:** ${thumbsDown || 0}\n` +
            `**Link:** [link to ${word}](${urbanURL || "https://www.urbandictionary.com/"})`;

        const maxDefinitionLength = 1024 - baseMessage.length - 20;

        let shortenedDefinition = escapedDefinition;
        if (escapedDefinition.length > maxDefinitionLength) {
            shortenedDefinition = `${escapedDefinition.slice(0, maxDefinitionLength - 15)}... [read more](${urbanURL})`;
        }

        let description = `**Definition:** ${shortenedDefinition}\n` +
            `${baseMessage}`;

        const embed = new EmbedBuilder()
            .setColor("#0efefe")
            .setAuthor({ name: `Urban Dictionary | ${word}` })
            .setDescription(description)
            .setTimestamp()
            .setFooter({ text: `Written by ${author || "unknown"}` });

        await sendReply(interaction, { embeds: [embed] });
        await deleteReply(interaction, { timeout: 30000 });
    }
};