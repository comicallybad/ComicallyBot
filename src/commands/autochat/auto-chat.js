const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { r, delr, re } = require("../../../utils/functions/functions.js");
const db = require("../../../utils/schemas/db.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('auto-chat')
        .setDescription('Manage the auto chat channel.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addSubcommand(subcommand => subcommand.setName('get').setDescription('Get the current auto chat channel.'))
        .addSubcommand(subcommand => subcommand.setName('set').setDescription('Set the auto chat channel.')
            .addChannelOption(option => option.setName('channel').setDescription('The channel to set as the auto chat channel.').setRequired(true)))
        .addSubcommand(subcommand => subcommand.setName('remove').setDescription('Remove the current auto chat channel.')),
    execute: async (interaction) => {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'get':
                return getAutoChatChannel(interaction);
            case 'set':
                return setAutoChatChannel(interaction);
            case 'remove':
                return removeAutoChatChannel(interaction);
        }
    },
};

async function getAutoChatChannel(interaction) {
    const exists = await db.findOne({ guildID: interaction.guild.id, channels: { $elemMatch: { command: "Bot Chatting" } } });
    if (!exists) return re(interaction, "There has been no bot chat channel set.").then(() => delr(interaction, 7500));
    const channel = await interaction.guild.channels.cache.get(exists.channels.filter(x => x.command === "Bot Chatting")[0].channelID);
    return r(interaction, `The bot chat channel is: ${channel}.`).then(() => delr(interaction, 30000));
}

async function setAutoChatChannel(interaction) {
    const channel = interaction.options.getChannel('channel');
    const exists = await db.findOne({ guildID: interaction.guild.id, channels: { $elemMatch: { command: "Bot Chatting" } } });
    if (exists) {
        await db.updateOne({ guildID: interaction.guild.id, 'channels.command': "Bot Chatting" }, {
            $set: { 'channels.$.command': "Bot Chatting", 'channels.$.channelID': channel.id, 'channels.$.channelName': channel.name, }
        });
    } else {
        await db.updateOne({ guildID: interaction.guild.id }, {
            $push: { channels: { command: "Bot Chatting", channelID: channel.id, channelName: channel.name } }
        });
    }
    return re(interaction, `Successfully ${exists ? "updated" : "added"} bot chat channel.`).then(() => delr(interaction, 7500));
}

async function removeAutoChatChannel(interaction) {
    const exists = await db.findOne({ guildID: interaction.guild.id, channels: { $elemMatch: { command: "Bot Chatting" } } });
    if (!exists) return r(interaction, "There has been no bot chat channel set.").then(() => delr(interaction, 7500));
    await db.updateOne({ guildID: interaction.guild.id, 'channels.command': "Bot Chatting" }, {
        $pull: { channels: { command: "Bot Chatting" } }
    });
    return re(interaction, "Removed bot chatting channel.").then(() => delr(interaction, 7500));
}