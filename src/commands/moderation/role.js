const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require("discord.js");
const { s, r, re, er, delr, messagePrompt, pageList } = require("../../../utils/functions/functions.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("role")
        .setDescription("Add or remove a role from a member.")
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addSubcommand(subcommand => subcommand.setName("add").setDescription("Add a role to a member.")
            .addUserOption(option => option.setName("user").setDescription("The user to add/remove the role from.").setRequired(true))
            .addRoleOption(option => option.setName("role").setDescription("The role to add/remove from the user.").setRequired(true)))
        .addSubcommand(subcommand => subcommand.setName("remove").setDescription("Remove a role from a member.")
            .addUserOption(option => option.setName("user").setDescription("The user to add/remove the role from.").setRequired(true))
            .addRoleOption(option => option.setName("role").setDescription("The role to add/remove from the user.").setRequired(true)))
        .addSubcommand(subCommand => subCommand.setName("info").setDescription("Get information about a role.")
            .addRoleOption(option => option.setName("role").setDescription("The role to get information about.").setRequired(true)))
        .addSubcommand(subCommand => subCommand.setName("users").setDescription("Get a list of users with a role.")
            .addRoleOption(option => option.setName("role").setDescription("The role to get a list of users from.").setRequired(true))),
    execute: async (interaction) => {
        const subCommand = interaction.options.getSubcommand();

        if (subCommand === "add" || subCommand === "remove") return handleAddRemove(interaction);
        if (subCommand === "info") return handleInfo(interaction);
        if (subCommand === "users") return handleUsers(interaction);
    }
}

async function handleAddRemove(interaction) {
    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles))
        return re(interaction, "I don't have permission to MANAGE ROLES!").then(() => delr(interaction, 15000));

    const subCommand = interaction.options.getSubcommand();
    const member = interaction.options.getMember("user");
    const role = interaction.options.getRole("role");

    if (member.id === interaction.user.id || member.id === interaction.guild.members.me.id)
        return re(interaction, "I can't perform this action.").then(() => delr(interaction, 15000));

    const promptEmbed = new EmbedBuilder()
        .setColor("#00ff00")
        .setAuthor({ name: `This verification becomes invalid after 30s.`, iconURL: interaction.user.displayAvatarURL() })
        .setDescription(`Do you want to ${subCommand} ${role} from ${member}?`);

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder().setCustomId("✅").setLabel("Confirm").setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId("❌").setLabel("Cancel").setStyle(ButtonStyle.Danger)
        );

    await r(interaction, "", promptEmbed)

    const collectedInteraction = await messagePrompt(interaction, row, 30000);

    if (collectedInteraction.customId === "❌")
        return er(interaction, "Selection cancelled.", [], []).then(() => delr(interaction, 15000))

    if (collectedInteraction.customId === "✅") {
        try {
            if (subCommand === "add") return addRole(interaction, member, role);
            if (subCommand === "remove") return removeRole(interaction, member, role);
        } catch (err) {
            return er(interaction, `An error occured while trying to ${subCommand} role: \n\`${err}\``, [], []).then(() => delr(interaction, 15000));
        }
    }
}

async function addRole(interaction, member, role) {
    const logChannel = interaction.guild.channels.cache.find(c => c.name.includes("action-logs"));
    await member.roles.add(role.id).then(() => {
        const embed = new EmbedBuilder()
            .setColor("#00ff00")
            .setTitle("Role Added")
            .setThumbnail(member.user.displayAvatarURL())
            .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp()
            .addFields({
                name: "__**Target**__",
                value: `${member}`,
                inline: true
            }, {
                name: "__**Role**__",
                value: `${role}`,
                inline: true
            }, {
                name: "__**Moderator**__",
                value: `${interaction.user}`,
                inline: true
            });

        if (logChannel) s(logChannel, "", embed);
        return er(interaction, `User successfully added to role.`, [], []).then(() => delr(interaction, 15000));
    });
}

async function removeRole(interaction, member, role) {
    const logChannel = interaction.guild.channels.cache.find(c => c.name.includes("action-logs"));
    await member.roles.remove(role.id).then(() => {
        const embed = new EmbedBuilder()
            .setColor("#FF0000")
            .setTitle("Role Removed")
            .setThumbnail(member.user.displayAvatarURL())
            .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp()
            .addFields({
                name: "__**Target**__",
                value: `${member}`,
                inline: true
            }, {
                name: "__**Role**__",
                value: `${role}`,
                inline: true
            }, {
                name: "__**Moderator**__",
                value: `${interaction.user}`,
                inline: true
            });

        if (logChannel) s(logChannel, "", embed);
        return er(interaction, `User successfully removed from role.`, [], []).then(() => delr(interaction, 15000));
    });
}

async function handleInfo(interaction) {
    const role = interaction.options.getRole('role');

    if (!role || !interaction.guild.roles.cache.has(role.id))
        return re(interaction, "Please provide a role to check.").then(() => delr(interaction, 7500));

    const embed = new EmbedBuilder()
        .setColor(`${role.hexColor}`)
        .setTitle(role.name)
        .addFields({
            name: "Role information:",
            value: `**Role name:** ${role.name}
            **Role ID:** \`${role.id}\`
            **Mentionable:** ${role.mentionable}
            **Hierarchy position:** \`${role.rawPosition + 1}\` (from bottom up)
            **Number of users in role:** \`${role.members.size}\``
        })
        .setTimestamp()

    return r(interaction, '', embed).then(() => delr(interaction, 30000));
}

async function handleUsers(interaction) {
    const role = interaction.options.getRole('role');

    if (!role || !interaction.guild.roles.cache.has(role.id))
        return re(interaction, "Please provide a role to check.").then(() => delr(interaction, 7500));

    const guildRole = await interaction.guild.roles.fetch(role.id);
    const members = guildRole.members.map(m => m);
    const embed = new EmbedBuilder()
        .setColor(guildRole.color)
        .setTitle(`${guildRole.name}: ${guildRole.members.size} members`)
        .setTimestamp()

    await r(interaction, '', embed);

    let array = members.map(member => `${member.user.username} (\`${member.user.id}\`)`);

    if (array.length <= 10) {
        array.forEach((user, index) => {
            embed.addFields({ name: `Role Member: ${index + 1}`, value: `${user}` });
        });
        return er(interaction, '', embed).then(() => delr(interaction, 30000));
    }
    else return pageList(interaction, array, embed, "Role Members:", 10, 0);
}