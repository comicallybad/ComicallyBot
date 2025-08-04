import {
    SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, MessageFlags, InteractionContextType, PermissionsBitField,
    Client, ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle, ModalSubmitInteraction
} from "discord.js";
import { sendReply, deleteReply } from "../../utils/replyUtils";
import { PermissionError, ValidationError } from "../../utils/customErrors";
import beautify from "beautify";

export default {
    ownerOnly: true,
    data: new SlashCommandBuilder()
        .setName("eval")
        .setDescription("Executes arbitrary JavaScript code (Owner Only).")
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .setContexts(InteractionContextType.Guild),
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        if (interaction.user.id !== process.env.BOT_OWNER_ID) {
            throw new PermissionError("This command can only be used by the bot owner.");
        }

        const modal = new ModalBuilder()
            .setCustomId("evalModal")
            .setTitle("Code Evaluation");

        const codeInput = new TextInputBuilder()
            .setCustomId("codeInput")
            .setLabel("Enter code to evaluate")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        const actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(codeInput);
        modal.addComponents(actionRow);

        await interaction.showModal(modal);

        let submission: ModalSubmitInteraction;
        try {
            submission = await interaction.awaitModalSubmit({
                filter: (i) => i.customId === "evalModal" && i.user.id === interaction.user.id,
                time: 300000,
            });
        } catch (err) {
            await deleteReply(interaction, { timeout: 0 });
            throw new ValidationError("Modal submission timed out.");
        }

        const code = submission.fields.getTextInputValue("codeInput");
        let result: any;
        let embed: EmbedBuilder;

        if (code.toLowerCase().includes("token")) {
            throw new ValidationError("You cannot use this command with sensitive information like tokens.");
        }

        try {
            result = await (async () => {
                return eval(code);
            })();

            const beautified = beautify(code, { format: "js" });
            embed = new EmbedBuilder()
                .setColor("#00FF00")
                .setTimestamp()
                .setFooter({ text: client.user?.username || "", iconURL: client.user?.displayAvatarURL() || "" })
                .setTitle("Eval")
                .addFields(
                    {
                        name: "Code to evaluate",
                        value: `\`\`\`js\n${beautified.length < 1014 ? beautified : beautified.substring(0, 1004) + "..."}\n\`\`\``
                    },
                    { name: "Evaluated: ", value: `${result}` },
                    { name: "Type of: ", value: `${typeof (result)}` }
                );
        } catch (error: any) {
            embed = new EmbedBuilder()
                .setTitle("\:x: Error!").setColor("#FF0000").setDescription(`${error}`)
                .setFooter({ text: client.user?.username || "", iconURL: client.user?.displayAvatarURL() || "" });
        }

        await sendReply(submission, { embeds: [embed], flags: MessageFlags.Ephemeral });
        await deleteReply(submission, { timeout: 30000 });
    },
};