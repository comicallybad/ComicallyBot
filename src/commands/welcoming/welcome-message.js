const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const db = require("../../../utils/schemas/db.js");
const { s, r, delr } = require("../../../utils/functions/functions.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('welcome-message')
        .setDescription('Manage the welcome message for new users.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addSubcommand(subcommand => subcommand.setName('get').setDescription('Get the current welcome message.'))
        .addSubcommand(subcommand => subcommand.setName('set').setDescription('Set a new welcome message.')
            .addStringOption(option => option.setName('message').setDescription('The new welcome message.').setRequired(true)))
        .addSubcommand(subcommand => subcommand.setName('remove').setDescription('Remove the current welcome message.')),
    execute: async (interaction) => {
        const subcommand = interaction.options.getSubcommand();
        const guildID = interaction.guild.id;
        const dbResult = await db.findOne({ guildID: guildID });

        if (subcommand === 'get') return getWelcomeMessage(interaction, dbResult);
        else if (subcommand === 'set') return setWelcomeMessage(interaction, dbResult);
        else if (subcommand === 'remove') return removeWelcomeMessage(interaction, dbResult);
    }
};

function getWelcomeMessage(interaction, dbResult) {
    if (!dbResult || !dbResult.welcomeMessage || dbResult.welcomeMessage.length === 0)
        return r(interaction, "A welcome message has not been set.").then(() => delr(interaction, 7500));
    return r(interaction, `The current welcome message is set to: ${dbResult.welcomeMessage}`).then(() => delr(interaction, 7500));
}

async function setWelcomeMessage(interaction, dbResult) {
    const newMessage = interaction.options.getString('message');

    if (newMessage.length >= 1024)
        return r(interaction, "The welcome message cannot be longer than 1024 characters.").then(m => del(m, 7500));

    if (dbResult) {
        dbResult.welcomeMessage = newMessage;
        await dbResult.save();
    }
    const logChannel = interaction.guild.channels.cache.find(c => c.name.includes("mod-logs")) || interaction.channel;
    const embed = new EmbedBuilder()
        .setColor("#0efefe")
        .setTitle("Welcome Message Changed")
        .setThumbnail(interaction.user.displayAvatarURL())
        .setFooter({ text: interaction.member.displayName, iconURL: interaction.user.displayAvatarURL() })
        .setTimestamp()
        .addFields({
            name: '__**Message**__',
            value: `${newMessage}`,
            inline: true
        }, {
            name: '__**Moderator**__',
            value: `${interaction.user}`,
            inline: true
        });

    s(logChannel, '', embed);
    return r(interaction, `The welcome message has been changed to: ${newMessage}`).then(() => delr(interaction, 7500));
}

async function removeWelcomeMessage(interaction, dbResult) {
    if (!dbResult || !dbResult.welcomeMessage || dbResult.welcomeMessage.length === 0)
        return r(interaction, "A welcome message has not been set.").then(() => delr(interaction, 7500));

    dbResult.welcomeMessage = undefined;
    await dbResult.save();
    const logChannel = interaction.guild.channels.cache.find(c => c.name.includes("mod-logs")) || interaction.channel;
    const embed = new EmbedBuilder()
        .setColor("#0efefe")
        .setTitle("Welcome Message Removed")
        .setThumbnail(interaction.user.displayAvatarURL())
        .setFooter({ text: interaction.member.displayName, iconURL: interaction.user.displayAvatarURL() })
        .setTimestamp()
        .setDescription(`**Welcome message removed By:** ${interaction.user}`);

    s(logChannel, '', embed);
    return r(interaction, "The welcome message has been removed.").then(() => delr(interaction, 7500));
}
