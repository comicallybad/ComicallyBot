import {
    SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, PermissionsBitField,
    MessageFlags, InteractionContextType, Client, ColorResolvable,
} from "discord.js";
import { getGlobalCommandUsage, getGuildCommandUsage, getCommandUsageByCommandName, getGuildUsage, } from "../../utils/dbUtils";
import { sendReply, deleteReply } from "../../utils/replyUtils";
import { PermissionError, ValidationError } from "../../utils/customErrors";

export default {
    data: new SlashCommandBuilder()
        .setName("usage")
        .setDescription("Provides statistics on command usage (Owner Only).")
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .setContexts(InteractionContextType.Guild)
        .addSubcommand(subcommand =>
            subcommand.setName("top_commands").setDescription("Shows the top used commands globally."))
        .addSubcommand(subcommand =>
            subcommand.setName("least_commands").setDescription("Shows the least used commands globally."))
        .addSubcommand(subcommand =>
            subcommand.setName("info").setDescription("Provides detailed information on command usage.")
                .addStringOption(option => option.setName("command_name").setDescription("The name of the command to get info for.").setRequired(false))
                .addStringOption(option => option.setName("guild_id").setDescription("The ID of the guild to get info for.").setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand.setName("unused").setDescription("Shows commands that have never been used."))
        .addSubcommand(subcommand =>
            subcommand.setName("top_guilds").setDescription("Shows the top guilds by command usage."))
        .addSubcommand(subcommand =>
            subcommand.setName("least_guilds").setDescription("Shows the least used guilds by command usage.")),
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        if (interaction.user.id !== process.env.BOT_OWNER_ID) {
            throw new PermissionError("This command can only be used by the bot owner.");
        }

        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case "top_commands":
                await handleCommandList(interaction, "top");
                break;
            case "least_commands":
                await handleCommandList(interaction, "least");
                break;
            case "info":
                await handleInfoCommand(interaction, client);
                break;
            case "unused":
                await handleUnusedCommands(interaction, client);
                break;
            case "top_guilds":
                await handleGuildList(interaction, client, "top");
                break;
            case "least_guilds":
                await handleGuildList(interaction, client, "least");
                break;
        }
    },
};

const getGuildNameAndId = async (client: Client, id: string) => {
    try {
        const guild = await client.guilds.fetch(id);
        return `${guild.name} (\`${id}\`)`;
    } catch (error) {
        return `(\`${id}\`)`;
    }
};

async function sendUsageEmbed(
    interaction: ChatInputCommandInteraction,
    title: string,
    color: ColorResolvable,
    data: any[],
    formatter: (item: any, index: number) => Promise<string> | string
) {
    if (!data || data.length === 0) {
        throw new ValidationError("No command usage data found.");
    }

    const embed = new EmbedBuilder().setTitle(title).setColor(color);

    const description = (await Promise.all(data.slice(0, 10).map(formatter))).join("\n");
    embed.setDescription(description);

    await sendReply(interaction, { embeds: [embed.toJSON()], flags: MessageFlags.Ephemeral });
    await deleteReply(interaction, { timeout: 30000 });
}

async function handleCommandList(interaction: ChatInputCommandInteraction, sortOrder: "top" | "least") {
    const globalUsage = await getGlobalCommandUsage();
    const totalUses = globalUsage.reduce((sum, command) => sum + command.totalCount, 0);

    const sortedUsage = [...globalUsage].sort((a, b) =>
        sortOrder === "top" ? b.totalCount - a.totalCount : a.totalCount - b.totalCount
    );

    await sendUsageEmbed(
        interaction,
        sortOrder === "top" ? "Top Used Commands (Global)" : "Least Used Commands (Global)",
        sortOrder === "top" ? "#00FF00" : "#FF0000",
        sortedUsage,
        (command, index) => {
            const percentage = totalUses > 0 ? ((command.totalCount / totalUses) * 100).toFixed(2) : "0.00";
            return `**${index + 1}.** \`/${command._id}\`: ${command.totalCount} uses (${percentage}%)`;
        }
    );
}

async function handleGuildList(interaction: ChatInputCommandInteraction, client: Client, sortOrder: "top" | "least") {
    const guilds = await getGuildUsage(sortOrder === "top" ? -1 : 1);
    const totalUses = guilds.reduce((sum, guild) => sum + guild.totalCount, 0);

    await sendUsageEmbed(
        interaction,
        sortOrder === "top" ? "Top Guilds by Command Usage" : "Least Used Guilds by Command Usage",
        sortOrder === "top" ? "#00FF00" : "#FF0000",
        guilds,
        async (guild, index) => {
            const percentage = totalUses > 0 ? ((guild.totalCount / totalUses) * 100).toFixed(2) : "0.00";
            const guildName = await getGuildNameAndId(client, guild._id);
            return `**${index + 1}.** ${guildName}: ${guild.totalCount} uses (${percentage}%)`;
        }
    );
}

async function handleInfoCommand(interaction: ChatInputCommandInteraction, client: Client) {
    const commandName = interaction.options.getString("command_name");
    const guildId = interaction.options.getString("guild_id");

    if (commandName && guildId) {
        const guildUsage = await getGuildCommandUsage(guildId);
        const commandData = guildUsage.find(usage => usage.commandName === commandName);
        if (!commandData) {
            throw new ValidationError(`No usage data found for command \`/${commandName}\` in guild \`${guildId}\`.`);
        }
        const guildName = await getGuildNameAndId(client, guildId);
        await sendUsageEmbed(interaction, `Usage for \`/${commandName}\` in ${guildName}`, "#0EFEFE", [commandData], (cmd) => `**Total Uses:** ${cmd.count}`);
    } else if (commandName) {
        const commandUsageByGuild = await getCommandUsageByCommandName(commandName);
        await sendUsageEmbed(interaction, `Top Guilds for \`/${commandName}\``, "#0EFEFE", commandUsageByGuild, async (usage, index) => {
            const guildName = await getGuildNameAndId(client, usage.guildId);
            return `**${index + 1}.** ${guildName}: ${usage.count} uses`;
        });
    } else if (guildId) {
        const guildUsage = await getGuildCommandUsage(guildId);
        const guildName = await getGuildNameAndId(client, guildId);
        await sendUsageEmbed(interaction, `Command Usage in ${guildName}`, "#0EFEFE", guildUsage, (cmd, index) => `**${index + 1}.** \`/${cmd.commandName}\`: ${cmd.count} uses`);
    } else {
        throw new ValidationError("Please provide either a command name or a guild ID.");
    }
}

async function handleUnusedCommands(interaction: ChatInputCommandInteraction, client: Client) {
    const allCommands = Array.from(client.commands.keys());
    const usedCommandsData = await getGlobalCommandUsage();
    const usedCommandNames = new Set(usedCommandsData.map(usage => usage._id));
    const unusedCommands = allCommands.filter(commandName => !usedCommandNames.has(commandName));

    if (unusedCommands.length === 0) {
        throw new ValidationError("All commands have been used at least once!");
    }

    await sendUsageEmbed(interaction, "Unused Commands", "#FF0000", unusedCommands, (cmdName) => `\`/${cmdName}\``);
}