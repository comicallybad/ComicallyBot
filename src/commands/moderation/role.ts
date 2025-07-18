import {
    SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, type ChatInputCommandInteraction,
    type GuildMember, type Role, type TextChannel, type ButtonInteraction, InteractionContextType, MessageFlags,
} from "discord.js";
import { deleteReply, editReply, sendReply } from "../../utils/replyUtils";
import { pageList, messagePrompt } from "../../utils/paginationUtils";
import { PermissionError, ValidationError } from "../../utils/customErrors";
import { sendMessage } from "../../utils/messageUtils";
import { getLogChannel } from "../../utils/channelUtils";

export default {
    data: new SlashCommandBuilder()
        .setName("role")
        .setDescription("Add, remove, view information, or view users for a role.")
        .setContexts(InteractionContextType.Guild)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addSubcommand(subcommand => subcommand
            .setName("add")
            .setDescription("Add a role to a member.")
            .addUserOption(option => option.setName("user").setDescription("The user to add the role to.").setRequired(true))
            .addRoleOption(option => option.setName("role").setDescription("The role to add to the user.").setRequired(true)))
        .addSubcommand(subcommand => subcommand
            .setName("remove")
            .setDescription("Remove a role from a member.")
            .addUserOption(option => option.setName("user").setDescription("The user to remove the role from.").setRequired(true))
            .addRoleOption(option => option.setName("role").setDescription("The role to remove from the user.").setRequired(true)))
        .addSubcommand(subcommand => subcommand
            .setName("info")
            .setDescription("Get information about a role.")
            .addRoleOption(option => option.setName("role").setDescription("The role to get information about.").setRequired(true)))
        .addSubcommand(subcommand => subcommand
            .setName("users")
            .setDescription("Get a list of users with a role.")
            .addRoleOption(option => option.setName("role").setDescription("The role to get a list of users from.").setRequired(true))),
    execute: async (interaction: ChatInputCommandInteraction) => {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case "add":
            case "remove":
                return handleAddRemove(interaction);
            case "info":
                return handleInfo(interaction);
            case "users":
                return handleUsers(interaction);
        }
    }
};

async function handleAddRemove(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild || !interaction.channel) {
        throw new ValidationError("This command can only be used in a server's text channel.");
    }

    const me = interaction.guild.members.me;
    if (!me || !me.permissions.has(PermissionFlagsBits.ManageRoles)) {
        throw new PermissionError("I require the `Manage Roles` permission for this command.");
    }

    const subCommand = interaction.options.getSubcommand();
    const member = interaction.options.getMember("user") as GuildMember;
    const role = interaction.options.getRole("role") as Role;

    if (member.id === interaction.user.id) {
        throw new ValidationError("You cannot manage your own roles.");
    }
    if (member.id === me.id) {
        throw new ValidationError("I cannot manage my own roles.");
    }
    if (role.managed) {
        throw new ValidationError("I cannot assign or remove a managed role.");
    }
    if (me.roles.highest.comparePositionTo(role) <= 0) {
        throw new ValidationError(`I cannot manage the ${role.name} role. Please ensure my highest role is above it.`);
    }

    const promptEmbed = new EmbedBuilder()
        .setColor("#0efefe")
        .setAuthor({ name: "This prompt becomes invalid after 30 seconds.", iconURL: interaction.user.displayAvatarURL() })
        .setDescription(`Are you sure you want to **${subCommand}** the ${role} role for ${member}?`);

    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder().setCustomId("confirm").setLabel("Confirm").setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId("cancel").setLabel("Cancel").setStyle(ButtonStyle.Danger)
        );

    await sendReply(interaction, { embeds: [promptEmbed.toJSON()], components: [row.toJSON()] });

    try {
        const collectedInteraction = await messagePrompt(interaction, row, 30000) as ButtonInteraction;

        if (collectedInteraction.customId === "cancel") {
            await sendReply(interaction, { content: "Selection cancelled.", flags: MessageFlags.Ephemeral });
            await deleteReply(interaction, { timeout: 0 });
            return;
        }

        if (collectedInteraction.customId === "confirm") {
            if (subCommand === "add") {
                await addRole(interaction, member, role);
            } else {
                await removeRole(interaction, member, role);
            }
        }
    } catch (err: unknown) {
        if (err === "time") {
            await deleteReply(interaction, { timeout: 0 });
            throw new ValidationError("Prompt timed out.");
        } else {
            throw err;
        }
    }
}

async function addRole(interaction: ChatInputCommandInteraction, member: GuildMember, role: Role) {
    await member.roles.add(role);
    await sendReply(interaction, { content: `Successfully added the ${role} role to ${member}.`, flags: MessageFlags.Ephemeral });
    await deleteReply(interaction, { timeout: 0 });

    const logChannel = getLogChannel(interaction.guild!, ["action-logs"]);
    if (logChannel) {
        const embed = new EmbedBuilder()
            .setColor("Green")
            .setTitle("Role Added")
            .setThumbnail(member.user.displayAvatarURL())
            .setFooter({ text: `Moderator: ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp()
            .addFields(
                { name: "Target", value: `${member}`, inline: true },
                { name: "Role", value: `${role}`, inline: true }
            );
        await sendMessage(logChannel, { embeds: [embed.toJSON()] });
    }
}

async function removeRole(interaction: ChatInputCommandInteraction, member: GuildMember, role: Role) {
    await member.roles.remove(role);
    await sendReply(interaction, { content: `Successfully removed the ${role} role from ${member}.`, flags: MessageFlags.Ephemeral });
    await deleteReply(interaction, { timeout: 0 });

    const logChannel = interaction.guild?.channels.cache.find(c => c.name.includes("action-logs")) as TextChannel | undefined;
    if (logChannel) {
        const embed = new EmbedBuilder()
            .setColor("Red")
            .setTitle("Role Removed")
            .setThumbnail(member.user.displayAvatarURL())
            .setFooter({ text: `Moderator: ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp()
            .addFields(
                { name: "Target", value: `${member}`, inline: true },
                { name: "Role", value: `${role}`, inline: true }
            );
        await sendMessage(logChannel, { embeds: [embed.toJSON()] });
    }
}

async function handleInfo(interaction: ChatInputCommandInteraction) {
    const role = interaction.options.getRole("role") as Role;

    const embed = new EmbedBuilder()
        .setColor(role.hexColor)
        .setTitle(`Role Information: ${role.name}`)
        .addFields(
            { name: "ID", value: `\`${role.id}\``, inline: true },
            { name: "Color", value: `\`${role.hexColor}\``, inline: true },
            { name: "Mentionable", value: role.mentionable ? "Yes" : "No", inline: true },
            { name: "Position", value: `\`${role.rawPosition}\``, inline: true },
            { name: "Created", value: `<t:${Math.round(role.createdTimestamp / 1000)}:R>`, inline: true },
            { name: "Members", value: `\`${role.members.size}\``, inline: true }
        )
        .setTimestamp();

    await sendReply(interaction, { embeds: [embed.toJSON()] });
    await deleteReply(interaction, { timeout: 30000 });
}

async function handleUsers(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) return;
    const role = interaction.options.getRole("role") as Role;

    await interaction.guild.members.fetch();
    const membersWithRole = role.members;

    if (membersWithRole.size === 0) {
        throw new ValidationError(`There are no users with the ${role} role.`);
    }

    const memberList = membersWithRole.map(m => `${m.user.username} (\`${m.id}\`)`);
    const title = `${role.name} Members (${membersWithRole.size})`;

    const embeds = [];
    const chunkSize = 10;

    for (let i = 0; i < memberList.length; i += chunkSize) {
        const chunk = memberList.slice(i, i + chunkSize);
        const embed = new EmbedBuilder()
            .setColor(role.hexColor)
            .setTitle(title)
            .setDescription(chunk.join("\n"))
            .setFooter({ text: `Page ${Math.floor(i / chunkSize) + 1} of ${Math.ceil(memberList.length / chunkSize)}` });
        embeds.push(embed);
    }

    await pageList(interaction, embeds, new EmbedBuilder(), title, 10, 0);
}