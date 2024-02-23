const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { s, r, delr } = require("../../../utils/functions/functions.js");
const db = require("../../../utils/schemas/db.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('welcome-channel')
        .setDescription('Manage the welcome channel.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addSubcommand(subcommand => subcommand.setName('get').setDescription('Get the current welcome channel.'))
        .addSubcommand(subcommand => subcommand.setName('set').setDescription('Set a new welcome channel.')
            .addChannelOption(option => option.setName('channel').setDescription('The channel to set as the welcome channel.').setRequired(true)))
        .addSubcommand(subcommand => subcommand.setName('remove').setDescription('Remove the current welcome channel.')),
    execute: (interaction) => {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand == "get") return getWelcomeChannel(interaction);
        else if (subcommand == "set") return setWelcomeChannel(interaction);
        else if (subcommand == "remove") return removeWelcomeChannel(interaction);
    }
};

async function getWelcomeChannel(interaction) {
    const guildID = interaction.guild.id;
    const dbResult = await db.findOne({ guildID: guildID, channels: { $elemMatch: { command: "welcome" } } });

    if (!dbResult) return r(interaction, "There has been no welcome channel set.").then(() => delr(interaction, 7500));

    const channel = await interaction.guild.channels.fetch(dbResult.channels.filter(x => x.command === "welcome")[0].channelID);
    return r(interaction, `The current welcome channel is set to: ${channel}`).then(() => delr(interaction, 7500));
}

async function setWelcomeChannel(interaction) {
    const channel = interaction.options.getChannel('channel');
    if (!channel) return interaction.reply("Please provide a channel.");

    const logChannel = interaction.guild.channels.cache.find(c => c.name.includes("mod-logs")) || interaction.channel;
    const guildID = interaction.guild.id;

    if (!interaction.guild.channels.cache.has(channel.id))
        return r(interaction, "Channel not found in this server.").then(() => delr(interaction, 7500));

    return dbUpdate(channel.id, channel.name);

    async function dbUpdate(channelID, channelName) {
        const dbResult = await db.findOne({ guildID: guildID, channels: { $elemMatch: { command: "welcome" } } });

        const embed = new EmbedBuilder()
            .setColor("#0efefe")
            .setThumbnail(interaction.user.avatarURL())
            .setFooter({ text: interaction.user.username, iconURL: interaction.user.avatarURL() })
            .setTimestamp()
            .addFields({
                name: '__**Channel**__',
                value: `${channelID}`,
                inline: true
            }, {
                name: '__**Moderator**__',
                value: `${interaction.user}`,
                inline: true
            });

        if (!dbResult) {
            embed.setTitle("Welcome Channel Set");
            await db.updateOne({ guildID: guildID }, {
                $push: { channels: { command: "welcome", channelID: channelID, channelName: channelName } }
            });
        } else {
            embed.setTitle("Welcome Channel Changed");
            await db.updateOne({ guildID: guildID, 'channels.command': "welcome" }, {
                $set: { 'channels.$.channelID': channelID, 'channels.$.channelName': channelName }
            });
        }

        s(logChannel, '', embed);
        return r(interaction, dbResult ? "Updated welcome channel." : "Welcome channel has been set.").then(() => delr(interaction, 7500));
    }
}

async function removeWelcomeChannel(interaction) {
    const dbResult = await db.findOne({ guildID: interaction.guild.id, channels: { $elemMatch: { command: "welcome" } } });

    if (!dbResult)
        return interaction.reply("There has been no welcome channel set.");

    const logChannel = interaction.guild.channels.cache.find(c => c.name.includes("mod-logs")) || interaction.channel;

    await db.updateOne({ guildID: interaction.guild.id, 'channels.command': "welcome" }, {
        $pull: { channels: { command: "welcome" } }
    });

    const embed = new EmbedBuilder()
        .setColor("#0efefe")
        .setTitle("Welcome Channel Removed")
        .setThumbnail(interaction.user.avatarURL())
        .setFooter({ text: interaction.user.username, iconURL: interaction.user.avatarURL() })
        .setTimestamp()
        .setDescription(`**Welcome channel removed By:** ${interaction.user}`);

    s(logChannel, '', embed);
    return r(interaction, "Removed welcome channel.").then(() => delr(interaction, 7500));
}