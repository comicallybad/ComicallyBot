const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { s, re, delr } = require("../../../utils/functions/functions.js");


module.exports = {
    data: new SlashCommandBuilder()
        .setName("announce")
        .setDescription("Make an announcement to a channel.")
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addStringOption(option => option.setName("message").setDescription("The message to send.").setRequired(true))
        .addChannelOption(option => option.setName("channel").setDescription("The channel to send the announcement to.").setRequired(false)),
    execute: (interaction) => {
        const message = interaction.options.getString("message");
        const channel = interaction.options.getChannel("channel") || interaction.channel;

        if (message.length >= 1995) {
            re(interaction, "Announcement sent, but shortened due to character limit.").then(() => delr(interaction, 30000));
            return s(channel, `${message.length <= 1995 ? message : message.substring(0, 1995) + "`...`"}`);
        } else {
            re(interaction, "Announcement sent.").then(() => delr(interaction, 30000));
            return s(channel, `${message.length <= 1995 ? message : message.substring(0, 1995) + "`...`"}`);
        }
    }
}