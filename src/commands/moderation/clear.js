const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { re, er, delr } = require("../../../utils/functions/functions.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Clears the chat.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addIntegerOption(option => option.setName('amount').setDescription('Number of messages to clear.').setMinValue(1).setMaxValue(100).setRequired(true))
        .addUserOption(option => option.setName('user').setDescription('User to clear messages from.')),
    execute: async (interaction) => {
        if (!interaction.channel.permissionsFor(interaction.guild.members.me).has(PermissionFlagsBits.ManageMessages))
            return re(interaction, "I do not have permissions to delete messages.").then(() => delr(interaction, 7500));

        const user = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');

        await re(interaction, `Clearing ${amount} messages...`).then(() => delr(interaction, 7500));

        interaction.channel.messages.fetch({ limit: 100 }).then((messages) => {
            if (user) messages = messages.filter(m => m.author.id === user.id);
            messages = Array.from(messages).map(m => m[1]).slice(0, amount);
            interaction.channel.bulkDelete(messages).catch(err => {
                return er(interaction, `There was an error attempting to delete that amount of messages:\n\`${err}\``).then(() => delr(interaction, 7500));
            });
        }).then(er(interaction, `Successfully deleted ${amount} messages.`).then(() => delr(interaction, 7500)));
    }
};