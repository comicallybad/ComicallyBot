import {
    SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, MessageFlags, InteractionContextType,
    PermissionsBitField, Client, ModalBuilder, TextInputBuilder, LabelBuilder, TextInputStyle, ModalSubmitInteraction
} from "discord.js";
import beautify from "beautify";
import { sendReply, deleteReply } from "../../utils/replyUtils";
import { PermissionError, ValidationError } from "../../utils/customErrors";

export default {
    ownerOnly: true,
    data: new SlashCommandBuilder()
        .setName("eval")
        .setDescription("Executes arbitrary JavaScript code (Owner Only).")
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .setContexts(InteractionContextType.Guild)
        .addStringOption(option => option.setName("guild-id").setDescription("The ID of the guild to fetch. Examples: 123456789012345678").setRequired(false))
        .addStringOption(option => option.setName("channel-id").setDescription("The ID of the channel to fetch. Examples: 123456789012345678").setRequired(false))
        .addStringOption(option => option.setName("message-id").setDescription("The ID of the message to fetch. Examples: 123456789012345678").setRequired(false))
        .addStringOption(option => option.setName("user-id").setDescription("The ID of the user to fetch. Examples: 123456789012345678").setRequired(false)),
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        if (interaction.user.id !== process.env.BOT_OWNER_ID) {
            throw new PermissionError("This command can only be used by the bot owner.");
        }

        const guildIdInput = interaction.options.getString("guild-id");
        const channelIdInput = interaction.options.getString("channel-id");
        const messageIdInput = interaction.options.getString("message-id");
        const userIdInput = interaction.options.getString("user-id");

        let targetGuild: any = null;
        let targetChannel: any = null;
        let targetMessage: any = null;
        let targetMember: any = null;
        let targetUser: any = null;
        let targetPlayer: any = null;

        if (guildIdInput) {
            try {
                targetGuild = await client.guilds.fetch(guildIdInput);
                if (!targetGuild) {
                    throw new Error("Guild not found.");
                }
            } catch (error) {
                throw new ValidationError(`Failed to fetch guild with ID "${guildIdInput}": ${error instanceof Error ? error.message : error}`);
            }
        }

        if (channelIdInput) {
            try {
                if (targetGuild) {
                    targetChannel = await targetGuild.channels.fetch(channelIdInput);
                } else {
                    targetChannel = await client.channels.fetch(channelIdInput);
                }
                if (!targetChannel) {
                    throw new Error("Channel not found.");
                }
            } catch (error) {
                throw new ValidationError(`Failed to fetch channel with ID "${channelIdInput}": ${error instanceof Error ? error.message : error}`);
            }
        }

        if (messageIdInput) {
            if (!targetGuild) {
                throw new ValidationError("A guild ID must be provided to fetch a message.");
            }
            if (!targetChannel) {
                throw new ValidationError("A channel ID must be provided to fetch a message.");
            }
            if (!("messages" in targetChannel)) {
                throw new ValidationError("The fetched channel is not a text-based channel.");
            }
            try {
                targetMessage = await targetChannel.messages.fetch(messageIdInput);
                if (!targetMessage) {
                    throw new Error("Message not found.");
                }
            } catch (error) {
                throw new ValidationError(`Failed to fetch message with ID "${messageIdInput}": ${error instanceof Error ? error.message : error}`);
            }
        }

        if (userIdInput) {
            try {
                if (targetGuild) {
                    targetMember = await targetGuild.members.fetch(userIdInput);
                    targetUser = targetMember.user;
                } else {
                    targetUser = await client.users.fetch(userIdInput);
                }
            } catch (error) {
                const typeStr = targetGuild ? "member" : "user";
                throw new ValidationError(`Failed to fetch ${typeStr} with ID "${userIdInput}": ${error instanceof Error ? error.message : error}`);
            }
        }

        if (targetGuild && client.music) {
            targetPlayer = client.music.players.get(targetGuild.id) || null;
        }

        const modal = new ModalBuilder()
            .setCustomId("evalModal")
            .setTitle("Code Evaluation");

        const codeInput = new TextInputBuilder()
            .setCustomId("codeInput")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        const label = new LabelBuilder()
            .setLabel("Enter code to evaluate")
            .setTextInputComponent(codeInput);

        modal.addLabelComponents(label);

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
            const guild = targetGuild;
            const channel = targetChannel;
            const message = targetMessage;
            const member = targetMember;
            const user = targetUser;
            const player = targetPlayer;

            const isAsync = code.includes("await");
            const wrappedCode = isAsync ? `(async () => {\n${code}\n})()` : code;
            let evaled = eval(wrappedCode);
            if (evaled instanceof Promise) {
                evaled = await evaled;
            }
            result = evaled;

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
                .setTitle(":x: Error!")
                .setColor("#FF0000")
                .setDescription(`${error}`)
                .setFooter({ text: client.user?.username || "", iconURL: client.user?.displayAvatarURL() || "" });
        }

        await sendReply(submission, { embeds: [embed], flags: MessageFlags.Ephemeral });
        await deleteReply(submission, { timeout: 30000 });
    },
};