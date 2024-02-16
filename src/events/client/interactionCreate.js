const { EmbedBuilder, PermissionFlagsBits, InteractionType } = require('discord.js');
const { s } = require('../../../utils/functions/functions.js');

const cooldown = new Set();

module.exports = async (client, interaction) => {
    if (interaction.isChatInputCommand())
        return handleChatInputCommand(client, interaction);
    else if (interaction.type == InteractionType.ApplicationCommandAutocomplete)
        return handleApplicationCommandAutocomplete(client, interaction);
    else if (interaction.type == InteractionType.MessageComponent)
        return handleMessageComponent(interaction);
    else return;
}

async function handleChatInputCommand(client, interaction) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction, client);
    } catch (error) {
        console.error(interaction.commandName);
        console.error(error.stack);
        const errorMessage = { content: `There was an error while executing this command: \n\`${error}\``, ephemeral: true };
        if (interaction.replied) return interaction.followUp(errorMessage);
        else return interaction.reply(errorMessage);
    }
}

async function handleApplicationCommandAutocomplete(client, interaction) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.autocomplete(interaction, client);
    } catch (error) {
        console.error(error.stack);
    }
}

async function handleMessageComponent(interaction) {
    const command = interaction.customId;
    if (!["save-", "delete-", "select-menu-roles"].includes(command.replace(/\d/g, ''))) return;

    if (command.includes("save-") || command.includes("delete-")) {
        if (command.includes(`${interaction.user.id}`) || interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            if (command.includes("save-")) {
                return interaction.update({ components: [] }).catch(err => err);
            } else if (command.includes("delete-")) {
                await interaction.deferUpdate().catch(err => err);
                return interaction.deleteReply().catch(err => err);
            }
        } else {
            if (cooldown.has(interaction.user.id))
                return interaction.deferUpdate().catch(err => err);
            cooldown.add(interaction.user.id);
            setTimeout(() => cooldown.delete(interaction.user.id), 30000);
            return interaction.reply({ content: "You do not have permission to use this button.", ephemeral: true }).catch(err => err);
        }
    }

    if (command === "select-menu-roles") {
        await interaction.deferUpdate().catch(err => err);

        const logChannel = interaction.guild.channels.cache.find(c => c.name.includes("role-logs")) || undefined;
        const options = interaction.message.components[0].components[0].options.map(option => option.value);
        const values = interaction.values;
        const embed = new EmbedBuilder()
            .setColor("#0EFEFE")
            .setTitle("User Role(s) Updated")
            .setThumbnail(interaction.user.displayAvatarURL())
            .setFooter({ text: `${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp()

        try {
            for (const option of options) {
                const role = interaction.guild.roles.cache.get(option);
                if (!role) return;

                if (!values.includes(option) && interaction.member.roles.cache.has(role.id)) {
                    await interaction.member.roles.remove(role);
                    embed.addFields({ name: "__**Removed**__", value: `${role}`, inline: true });
                } else if (values.includes(option) && !interaction.member.roles.cache.has(role.id)) {
                    await interaction.member.roles.add(role);
                    embed.addFields({ name: "__**Added**__", value: `${role}`, inline: true });
                }
            }
            if (logChannel && embed.data.fields) s(logChannel, "", embed);
            return interaction.followUp({ content: "Roles updated.", ephemeral: true });
        } catch (error) {
            return interaction.followUp({ content: `There was an error while attempting to assign role(s): \n\`${error}\``, ephemeral: true });
        }
    }
}