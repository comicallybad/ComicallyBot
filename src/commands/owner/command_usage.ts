import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, PermissionsBitField, MessageFlags, InteractionContextType, Client } from "discord.js";
import { getGlobalCommandUsage, getGuildCommandUsage, getCommandUsageByCommandName, getTopGuildsByUsage, getLeastUsedGuildsByUsage } from "../../utils/dbUtils";
import { sendReply, deleteReply } from "../../utils/replyUtils";
import { PermissionError, ValidationError } from "../../utils/customErrors";

export default {
    data: new SlashCommandBuilder()
        .setName("command_usage")
        .setDescription("Provides statistics on command usage (Owner Only).")
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .setContexts(InteractionContextType.Guild)
        .addSubcommand(subcommand =>
            subcommand.setName("top").setDescription("Shows the top used commands globally."))
        .addSubcommand(subcommand =>
            subcommand.setName("least").setDescription("Shows the least used commands globally."))
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
            case "top":
                await handleTopCommands(interaction);
                break;
            case "least":
                await handleLeastCommands(interaction);
                break;
            case "info":
                await handleInfoCommand(interaction, client);
                break;
            case "unused":
                await handleUnusedCommands(interaction, client);
                break;
            case "top_guilds":
                await handleTopGuilds(interaction, client);
                break;
            case "least_guilds":
                await handleLeastGuilds(interaction, client);
                break;
        }
    },
};

async function handleTopCommands(interaction: ChatInputCommandInteraction) {
    const globalUsage = await getGlobalCommandUsage();

    if (globalUsage.length === 0) {
        throw new ValidationError("No command usage data found.");
    }

    const embed = new EmbedBuilder()
        .setTitle("Top Used Commands (Global)")
        .setColor("#00FF00");

    let description = "";
    const totalUses = globalUsage.reduce((sum, command) => sum + command.totalCount, 0);
    for (let i = 0; i < Math.min(10, globalUsage.length); i++) {
        const percentage = totalUses > 0 ? ((globalUsage[i].totalCount / totalUses) * 100).toFixed(2) : 0;
        description += `**${i + 1}.** ` + "`" + `/${globalUsage[i]._id}` + "`" + `: ${globalUsage[i].totalCount} uses (${percentage}%)\n`;
    }
    embed.setDescription(description);

    await sendReply(interaction, { embeds: [embed.toJSON()], flags: MessageFlags.Ephemeral });
    await deleteReply(interaction, { timeout: 30000 });
}

async function handleLeastCommands(interaction: ChatInputCommandInteraction) {
    const globalUsage = await getGlobalCommandUsage();

    if (globalUsage.length === 0) {
        throw new ValidationError("No command usage data found.");
    }

    const embed = new EmbedBuilder()
        .setTitle("Least Used Commands (Global)")
        .setColor("#FF0000");

    let description = "";
    const totalUses = globalUsage.reduce((sum, command) => sum + command.totalCount, 0);
    const startIndex = Math.max(0, globalUsage.length - 10);
    for (let i = globalUsage.length - 1; i >= startIndex; i--) {
        const percentage = totalUses > 0 ? ((globalUsage[i].totalCount / totalUses) * 100).toFixed(2) : 0;
        description += `**${globalUsage.length - i}.** ` + "`" + `/${globalUsage[i]._id}` + "`" + `: ${globalUsage[i].totalCount} uses (${percentage}%)\n`;
    }
    embed.setDescription(description);

    await sendReply(interaction, { embeds: [embed.toJSON()], flags: MessageFlags.Ephemeral });
    await deleteReply(interaction, { timeout: 30000 });
}

async function handleInfoCommand(interaction: ChatInputCommandInteraction, client: Client) {
    const commandName = interaction.options.getString("command_name");
    const guildId = interaction.options.getString("guild_id");

    const getGuildNameAndId = async (id: string) => {
        try {
            const guild = await client.guilds.fetch(id);
            return `${guild.name} (\`${id}\`)`;
        } catch (error) {
            return `(\`${id}\`)`;
        }
    };

    if (commandName && guildId) {
        // Specific command in specific guild
        const guildUsage = await getGuildCommandUsage(guildId);
        const commandData = guildUsage.find(usage => usage.commandName === commandName);

        if (!commandData) {
            throw new ValidationError("No usage data found for command `" + `/${commandName}` + "` in guild `" + `${guildId}` + "`.");
        }

        const formattedGuildId = await getGuildNameAndId(guildId);
        const embed = new EmbedBuilder()
            .setTitle("Usage for `" + `/${commandName}` + "` in Guild " + formattedGuildId)
            .setColor("#0099FF")
            .setDescription(`**Total Uses:** ${commandData.count}`);

        await sendReply(interaction, { embeds: [embed.toJSON()], flags: MessageFlags.Ephemeral });
        await deleteReply(interaction, { timeout: 30000 });

    } else if (commandName) {
        // Top guilds for a specific command
        const commandUsageByGuild = await getCommandUsageByCommandName(commandName);

        if (commandUsageByGuild.length === 0) {
            throw new ValidationError("No usage data found for command `" + `/${commandName}` + "`.");
        }

        const embed = new EmbedBuilder()
            .setTitle("Top Guilds for `" + `/${commandName}` + "`")
            .setColor("#0EFEFE");

        let description = "";
        for (let i = 0; i < Math.min(10, commandUsageByGuild.length); i++) {
            const formattedGuildId = await getGuildNameAndId(commandUsageByGuild[i].guildId);
            description += `**${i + 1}.** ${formattedGuildId}: ${commandUsageByGuild[i].count} uses\n`;
        }
        embed.setDescription(description);

        await sendReply(interaction, { embeds: [embed.toJSON()], flags: MessageFlags.Ephemeral });
        await deleteReply(interaction, { timeout: 30000 });

    } else if (guildId) {
        // All commands in a specific guild
        const guildUsage = await getGuildCommandUsage(guildId);

        if (guildUsage.length === 0) {
            throw new ValidationError("No command usage data found for guild `" + `${guildId}` + "`.");
        }

        const formattedGuildId = await getGuildNameAndId(guildId);
        const embed = new EmbedBuilder()
            .setTitle("Command Usage in Guild " + formattedGuildId)
            .setColor("#0EFEFE");

        let description = "";
        for (let i = 0; i < Math.min(10, guildUsage.length); i++) {
            description += `**${i + 1}.** ` + "`" + `/${guildUsage[i].commandName}` + "`" + `: ${guildUsage[i].count} uses\n`;
        }
        embed.setDescription(description);

        await sendReply(interaction, { embeds: [embed.toJSON()], flags: MessageFlags.Ephemeral });
        await deleteReply(interaction, { timeout: 30000 });

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

    const embed = new EmbedBuilder()
        .setTitle("Unused Commands")
        .setColor("#FF0000");

    let description = "";
    unusedCommands.forEach(commandName => {
        description += `\`/${commandName}\`\n`;
    });
    embed.setDescription(description);

    await sendReply(interaction, { embeds: [embed.toJSON()], flags: MessageFlags.Ephemeral });
    await deleteReply(interaction, { timeout: 30000 });
}

async function handleTopGuilds(interaction: ChatInputCommandInteraction, client: Client) {
    const topGuilds = await getTopGuildsByUsage();
    if (topGuilds.length === 0) {
        throw new ValidationError("No guild usage data found.");
    }
    const embed = new EmbedBuilder()
        .setTitle("Top Guilds by Command Usage")
        .setColor("#00FF00");

    let description = "";
    const totalUses = topGuilds.reduce((sum, guild) => sum + guild.totalCount, 0);
    const getGuildNameAndId = async (id: string) => {
        try {
            const guild = await client.guilds.fetch(id);
            return `${guild.name} (` + "`" + `${id}` + "`" + `)`;
        } catch (error) {
            return `(` + "`" + `${id}` + "`" + `)`;
        }
    };

    for (let i = 0; i < Math.min(10, topGuilds.length); i++) {
        const percentage = totalUses > 0 ? ((topGuilds[i].totalCount / totalUses) * 100).toFixed(2) : 0;
        const formattedGuildId = await getGuildNameAndId(topGuilds[i]._id);
        description += `**${i + 1}.** ${formattedGuildId}: ${topGuilds[i].totalCount} uses (${percentage}%)\n`;
    }
    embed.setDescription(description);

    await sendReply(interaction, { embeds: [embed.toJSON()], flags: MessageFlags.Ephemeral });
    await deleteReply(interaction, { timeout: 30000 });
}

async function handleLeastGuilds(interaction: ChatInputCommandInteraction, client: Client) {
    const leastGuilds = await getLeastUsedGuildsByUsage();
    if (leastGuilds.length === 0) {
        throw new ValidationError("No guild usage data found.");
    }
    const embed = new EmbedBuilder()
        .setTitle("Least Used Guilds by Command Usage")
        .setColor("#FF0000");

    let description = "";
    const totalUses = leastGuilds.reduce((sum, guild) => sum + guild.totalCount, 0);
    const getGuildNameAndId = async (id: string) => {
        try {
            const guild = await client.guilds.fetch(id);
            return `${guild.name} (` + "`" + `${id}` + "`" + `)`;
        } catch (error) {
            return `(` + "`" + `${id}` + "`" + `)`;
        }
    };

    for (let i = 0; i < Math.min(10, leastGuilds.length); i++) {
        const percentage = totalUses > 0 ? ((leastGuilds[i].totalCount / totalUses) * 100).toFixed(2) : 0;
        const formattedGuildId = await getGuildNameAndId(leastGuilds[i]._id);
        description += `**${i + 1}.** ${formattedGuildId}: ${leastGuilds[i].totalCount} uses (${percentage}%)\n`;
    }
    embed.setDescription(description);

    await sendReply(interaction, { embeds: [embed.toJSON()], flags: MessageFlags.Ephemeral });
    await deleteReply(interaction, { timeout: 30000 });
}