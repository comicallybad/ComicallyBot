const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { s, re, delr } = require("../../../utils/functions/functions.js");


module.exports = {
    data: new SlashCommandBuilder()
        .setName("announce")
        .setDescription("Make an announcement to a channel.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addStringOption(option => option.setName("message").setDescription("The message to send.").setMaxLength(2000).setRequired(true))
        .addChannelOption(option => option.setName("channel").setDescription("The channel to send the announcement to.").setRequired(false)),
    execute: (interaction) => {
        const message = interaction.options.getString("message");
        const channel = interaction.options.getChannel("channel") || interaction.channel;

        re(interaction, "Announcement sent.").then(() => delr(interaction, 30000));
        return s(channel, `${message}`);
    }
}