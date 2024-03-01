const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { s, re, delr } = require("../../../utils/functions/functions.js");
const db = require("../../../utils/schemas/db.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('welcome-message')
        .setDescription('Manage the welcome message for new users.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addSubcommand(subcommand => subcommand.setName('get').setDescription('Get the current welcome message.'))
        .addSubcommand(subcommand => subcommand.setName('set').setDescription('Set a new welcome message.'))
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
        return re(interaction, "A welcome message has not been set.").then(() => delr(interaction, 7500));
    return re(interaction, `The current welcome message is set to: ${dbResult.welcomeMessage}`).then(() => delr(interaction, 7500));
}

async function setWelcomeMessage(interaction, dbResult) {
    const modal = new ModalBuilder()
        .setCustomId(`welcome-${interaction.id}`)
        .setTitle("Welcome Message")

    const textInput = new TextInputBuilder()
        .setCustomId("welcome-input")
        .setLabel("Welcome Message")
        .setPlaceholder("Enter the welcome message here.")
        .setMaxLength(2000)
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true)

    const actionRow = new ActionRowBuilder().addComponents(textInput);
    modal.addComponents(actionRow);

    await interaction.showModal(modal)

    const submitted = await interaction.awaitModalSubmit({
        time: 30000,
        filter: i => i.user.id === interaction.user.id && i.customId.includes(interaction.id)
    }).catch(err => err);

    if (!submitted.fields) return;

    const newMessage = submitted.fields.getTextInputValue("welcome-input")

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
    return re(submitted, `The welcome message has been changed to: ${newMessage}`).then(() => delr(submitted, 7500));
}

async function removeWelcomeMessage(interaction, dbResult) {
    if (!dbResult || !dbResult.welcomeMessage || dbResult.welcomeMessage.length === 0)
        return re(interaction, "A welcome message has not been set.").then(() => delr(interaction, 7500));

    dbResult.welcomeMessage = undefined;
    await dbResult.save();
    const logChannel = interaction.guild.channels.cache.find(c => c.name.includes("mod-logs")) || interaction.channel;
    const embed = new EmbedBuilder()
        .setColor("#0efefe")
        .setTitle("Welcome Message Removed")
        .setThumbnail(interaction.user.displayAvatarURL())
        .setFooter({ text: interaction.member.displayName, iconURL: interaction.user.displayAvatarURL() })
        .setTimestamp()
        .addFields({
            name: '__**Moderator**__',
            value: `${interaction.user}`,
            inline: true
        });

    s(logChannel, '', embed);
    return re(interaction, "The welcome message has been removed.").then(() => delr(interaction, 7500));
}
