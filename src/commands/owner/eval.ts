import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, MessageFlags, InteractionContextType, PermissionsBitField, Client } from "discord.js";
import { sendReply, deleteReply } from "../../utils/replyUtils";
import { PermissionError, ValidationError } from "../../utils/customErrors";
import beautify from "beautify";

export default {
    ownerOnly: true,
    data: new SlashCommandBuilder()
        .setName("eval")
        .setDescription("Executes arbitrary JavaScript code (Owner Only).")
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .setContexts(InteractionContextType.Guild)
        .addStringOption(option =>
            option.setName("code").setDescription("The code to execute.").setRequired(true)),
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        if (interaction.user.id !== process.env.BOT_OWNER_ID) {
            throw new PermissionError("This command can only be used by the bot owner.");
        }

        const code = interaction.options.getString("code", true);
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
                .setFooter({ text: interaction.client.user?.username || "", iconURL: interaction.client.user?.displayAvatarURL() || "" })
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
                .setFooter({ text: interaction.client.user?.username || "", iconURL: interaction.client.user?.displayAvatarURL() || "" });
        }

        await sendReply(interaction, { embeds: [embed], flags: MessageFlags.Ephemeral });
        await deleteReply(interaction, { timeout: 30000 });
    },
};