import { Interaction, Client, InteractionType, User, MessageFlags, PermissionFlagsBits, GuildMember } from "discord.js";
import { incrementCommandUsage } from "../../utils/dbUtils";
import { canCommunicate } from "../../utils/preconditions";
import { deferUpdate, deleteReply, sendReply, sendUpdate } from "../../utils/replyUtils";
import { PermissionError, ValidationError } from "../../utils/customErrors";
import { logError } from "../../utils/logUtils";
import * as dotenv from "dotenv";

dotenv.config();

const cooldown: Set<string> = new Set();

export default {
    name: "interactionCreate",
    async execute(client: Client, interaction: Interaction) {
        if (interaction.type === InteractionType.ApplicationCommand) {
            return handleChatInputCommand(client, interaction);
        } else if (interaction.type === InteractionType.ApplicationCommandAutocomplete) {
            return handleApplicationCommandAutocomplete(client, interaction);
        } else if (interaction.type === InteractionType.MessageComponent) {
            return handleMessageComponent(interaction);
        } else return;
    },
};

async function handleChatInputCommand(client: Client, interaction: Interaction) {
    if (!interaction.isChatInputCommand()) return;

    if (!await canCommunicate(interaction)) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    if (interaction.guildId && !command.ownerOnly) {
        await incrementCommandUsage(interaction.commandName, interaction.guildId);
    }

    try {
        await command.execute(interaction, client);
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        if (error instanceof PermissionError || error instanceof ValidationError) {
            await sendReply(interaction, { content: errorMessage, flags: MessageFlags.Ephemeral });
        } else {
            const time = new Date();
            const errorStack = error instanceof Error ? error.stack : "No stack trace available";

            const errorLog = {
                time: time.toLocaleString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true }),
                command: interaction.commandName,
                subcommand: interaction.options.getSubcommand(false) || null,
                options: interaction.options.data ? JSON.stringify(interaction.options.data) : null,
                guild: interaction.guild?.id || "DM",
                guildName: interaction.guild?.name || "DM",
                user: interaction.user.id,
                userName: interaction.user.tag,
                error: errorMessage,
            };

            await logError(errorLog, "Interaction Error");
            await logError(errorStack, "Stack Trace");

            const userFriendlyMessage = { content: `There was an unexpected error while executing this command: \n\`\`\`${errorMessage}\`\`\``, flags: MessageFlags.Ephemeral };
            await sendReply(interaction, userFriendlyMessage);

            if (process.env.BOT_OWNER_ID) {
                try {
                    const owner = await client.users.fetch(process.env.BOT_OWNER_ID) as User;
                    if (owner) {
                        await owner.send(`Error in command \`${interaction.commandName}\`:\n\`\`\`json\n${JSON.stringify(errorLog, null, 2)}\n\`\`\`\nStack Trace:\n\`\`\`\n${errorStack}\n\`\`\``);
                    }
                } catch (dmError) {
                    await logError(dmError, "Failed to send error DM to bot owner");
                }
            }
        }
    }
}

async function handleApplicationCommandAutocomplete(client: Client, interaction: Interaction) {
    if (!interaction.isAutocomplete()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command || !command.autocomplete) return;

    try {
        await command.autocomplete(interaction, client);
    } catch (error: unknown) {
        await logError(error, "Autocomplete Error");
    }
}

async function handleMessageComponent(interaction: Interaction) {
    if (!interaction.isMessageComponent()) return;

    const customId = interaction.customId;
    const messageOwnerId = customId.split("-")[1];
    const isOwnerOfMessage = messageOwnerId === interaction.user.id;
    const hasManageMessages = interaction.inGuild() && interaction.member instanceof GuildMember && interaction.member.permissions.has(PermissionFlagsBits.ManageMessages);

    if (customId.startsWith("save-")) {
        if (isOwnerOfMessage || hasManageMessages) {
            return sendUpdate(interaction, { components: [] });
        } else {
            if (cooldown.has(interaction.user.id)) {
                return deferUpdate(interaction);
            }
            cooldown.add(interaction.user.id);
            setTimeout(() => cooldown.delete(interaction.user.id), 30000);
            throw new PermissionError("You do not have permission to use this button.");
        }
    } else if (customId.startsWith("delete-")) {
        if (isOwnerOfMessage || hasManageMessages) {
            await deferUpdate(interaction);
            return deleteReply(interaction, { timeout: 0 });
        } else {
            if (cooldown.has(interaction.user.id)) {
                return deferUpdate(interaction);
            }
            cooldown.add(interaction.user.id);
            setTimeout(() => cooldown.delete(interaction.user.id), 30000);
            throw new PermissionError("You do not have permission to use this button.");
        }
    }
}