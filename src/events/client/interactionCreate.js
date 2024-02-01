const { InteractionType, EmbedBuilder } = require('discord.js');
const { s } = require('../../../utils/functions/functions.js');

module.exports = async (client, interaction) => {
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction, client);
        } catch (error) {
            console.error(interaction.commandName);
            console.error(error.stack);
            const errorMessage = { content: `There was an error while executing this command: \n\`${error}\``, ephemeral: true };
            if (interaction.replied) {
                await interaction.followUp(errorMessage);
            } else {
                await interaction.reply(errorMessage);
            }
        }
    } else if (interaction.type == InteractionType.ApplicationCommandAutocomplete) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.autocomplete(interaction, client);
        } catch (error) {
            console.error(error.stack);
        }

    } else if (interaction.type == InteractionType.MessageComponent) {
        const command = interaction.customId;
        if (command !== "select-menu-roles") return;

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
            await interaction.followUp({ content: "Roles updated.", ephemeral: true });
        } catch (error) {
            await interaction.followUp({ content: `There was an error while attempting to assign role(s): \n\`${error}\``, ephemeral: true });
        }
    } else return;
}