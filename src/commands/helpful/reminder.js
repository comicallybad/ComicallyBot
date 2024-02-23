const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const humanizeDuration = require("humanize-duration");
const { re, delr } = require("../../../utils/functions/functions.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reminder')
        .setDescription('Set yourself a reminder, or use as a timer.')
        .addStringOption(option => option.setName('time').setDescription('Time for the reminder').setRequired(true))
        .addStringOption(option => option.setName('reminder').setMaxLength(1024).setDescription('Reminder message')),
    execute: (interaction) => {
        const timeInput = interaction.options.getString('time');
        const reminder = interaction.options.getString('reminder');
        const user = interaction.user;

        if (timeInput.match(/^(?:(?:([01]?\d|2[0-3]):)?([0-5]?\d):)?([0-5]?\d)$/) == null)
            return re(interaction, "Please provide a valid time: Ex: hh:mm:ss").then(() => delr(interaction, 7500));

        const timeSplit = timeInput.split(":");
        const time = ((timeSplit[0] * 3600000) + (timeSplit[1] * 60000) + (timeSplit[2]) * 1000);

        if (!reminder) {
            const embed = new EmbedBuilder()
                .setColor("#0efefe")
                .setTitle(`**Timer**`)
                .setDescription(`${user}, your timer is finished!`)
                .setFooter({ text: `Time elapsed: ${humanizeDuration(time)}`, iconURL: user.displayAvatarURL() });

            re(interaction, `${humanizeDuration(time)} timer set`).then(() => delr(interaction, 7500));

            return setTimeout(() => interaction.followUp({ embeds: [embed] }), time);
        } else {
            const embed = new EmbedBuilder()
                .setColor("#0efefe")
                .setTitle(`**Reminder**`)
                .setDescription(`${user}, I am reminding you: ${reminder}!`)
                .setFooter({ text: `Time elapsed: ${humanizeDuration(time)}`, iconURL: user.displayAvatarURL() });

            re(interaction, `You will be reminded in ${humanizeDuration(time)}.`).then(() => delr(interaction, 7500));

            return setTimeout(() => interaction.followUp({ embeds: [embed] }), time);
        }
    }
}