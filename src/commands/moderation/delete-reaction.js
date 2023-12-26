const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { s, r, er, delr } = require("../../../utils/functions/functions.js");
const db = require("../../../utils/schemas/db.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('delete-reaction')
        .setDescription('Manages the delete reaction emoji.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addSubcommand(subcommand => subcommand.setName('get').setDescription('Shows the current delete reaction emoji.'))
        .addSubcommand(subcommand => subcommand.setName('set').setDescription('Sets an emoji to which, when added as a reaction, will delete the message.')
            .addStringOption(option => option.setName('emoji').setDescription('The emoji to set as the delete reaction.')))
        .addSubcommand(subcommand => subcommand.setName('remove').setDescription('Removes the delete reaction emoji.')),
    execute: (interaction) => {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'get') return getDeleteReaction(interaction);
        else if (subcommand === 'set') return setDeleteReaction(interaction);
        else if (subcommand === 'remove') return removeDeleteReaction(interaction);
    }
}

async function getDeleteReaction(interaction) {
    let exists = await db.findOne({ guildID: interaction.guild.id }).catch(err => err);
    if (!exists || !exists.deleteReaction)
        return r(interaction, "A delete reaction emoji has not been set.").then(() => delr(interaction, 7500));
    const reaction = exists.deleteReaction;

    return r(interaction, `The current delete reaction has been set to: ${reaction}`).then(m => delr(interaction, 30000));
}

async function setDeleteReaction(interaction) {
    if (!interaction.guild.members.me.permissions.has("MANAGE_MESSAGES"))
        return r(interaction, "I am missing permissions to `MANAGE_MESSAGES`!").then(() => delr(interaction, 7500));

    if (!interaction.guild.members.me.permissions.has("ADD_REACTIONS"))
        return r(interaction, "I am missing permissions to `ADD_REACTIONS` to validate the provided emoji.").then(m => del(m, 7500));

    const reaction = interaction.options.getString('emoji');

    await r(interaction, "Validating Reaction Emoji");
    let validate = await interaction.fetchReply();

    return validate.react(reaction).then(() => {
        er(interaction, "Delete reaction emoji has been verified and set.").then(() => delr(interaction, 7500));

        db.updateOne({ guildID: interaction.guild.id }, {
            $set: { deleteReaction: reaction }
        }).catch(err => err);

        const logChannel = interaction.guild.channels.cache.find(c => c.name.includes("mod-logs")) || interaction.channel;
        const embed = new EmbedBuilder()
            .setTitle("Delete Reaction Set")
            .setColor("#0efefe")
            .setThumbnail(interaction.member.user.displayAvatarURL())
            .setFooter({ text: interaction.member.displayName, iconURL: interaction.member.user.displayAvatarURL() })
            .setTimestamp()
            .setFields({
                name: '__**Reaction**__',
                value: `${reaction}`,
                inline: true
            }, {
                name: '__**Moderator**__',
                value: `${interaction.member}`,
                inline: true
            });

        return s(logChannel, '', embed);
    }).catch(err => {
        return er(interaction, `The provided reaction emoji could not be used: ${err}`).then(() => delr(interaction, 7500));
    });
}

async function removeDeleteReaction(interaction) {
    let exists = await db.findOne({ guildID: interaction.guild.id }).catch(err => err);
    if (!exists || !exists.deleteReaction)
        return r(interaction, "A delete reaction emoji has not been set.").then(() => delr(interaction, 7500));

    db.updateOne({ guildID: interaction.guild.id }, {
        $unset: { deleteReaction: "" }
    }).catch(err => err);

    return r(interaction, "The delete reaction emoji has been removed.").then(() => delr(interaction, 7500));
}