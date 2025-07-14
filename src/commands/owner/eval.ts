import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, MessageFlags, InteractionContextType, PermissionsBitField } from "discord.js";
import { sendReply, deleteReply } from "../../utils/replyUtils";
import { PermissionError, ValidationError } from "../../utils/customErrors";
import beautify from "beautify";

export default {
    data: new SlashCommandBuilder()
        .setName("eval")
        .setDescription("Executes arbitrary JavaScript code (Owner Only).")
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .setContexts(InteractionContextType.Guild)
        .addStringOption(option =>
            option.setName("code")
                .setDescription("The code to execute.")
                .setRequired(true)
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        if (interaction.user.id !== process.env.BOT_OWNER_ID) {
            throw new PermissionError("This command can only be used by the bot owner.");
        }

        const code = interaction.options.getString("code", true);
        let result: any;
        let embed: EmbedBuilder;

        if (code.toLowerCase().includes("token") || code.toLowerCase().includes("openai")) {
            throw new ValidationError("You cannot use this command with sensitive information like tokens.");
        }

        try {
            result = await (async () => {
                return eval(code);
            })();

            embed = new EmbedBuilder()
                .setColor("#00FF00")
                .setTimestamp()
                .setFooter({ text: interaction.client.user?.username || "", iconURL: interaction.client.user?.displayAvatarURL() || "" })
                .setTitle("Eval")
                .addFields({
                    name: "Code to evaluate",
                    value: "```js\n" +
                        (beautify(code, { format: "js" }).length < 1014 ? beautify(code, { format: "js" }) : beautify(code, { format: "js" }).substring(0, 1004) + "...") +
                        "\n```"
                }, {
                    name: "Evaluated: ",
                    value: `${result}`
                }, {
                    name: "Type of: ",
                    value: `${typeof (result)}`
                });
        } catch (error: any) {
            embed = new EmbedBuilder()
                .setColor("#FF0000")
                .setTitle("\:x: Error!")
                .setDescription(`${error}`)
                .setFooter({ text: interaction.client.user?.username || "", iconURL: interaction.client.user?.displayAvatarURL() || "" });
        }

        await sendReply(interaction, { embeds: [embed.toJSON()], flags: MessageFlags.Ephemeral });
        await deleteReply(interaction, { timeout: 15000 });
    },
};