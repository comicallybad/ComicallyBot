const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { s, r, delr } = require("../../../utils/functions/functions.js");
const db = require("../../../utils/schemas/db.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('auto-mod-toggle')
        .setDescription('Toggles the anti-spam or anti-phishing system on or off.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addSubcommand(subcommand => subcommand.setName('antispam').setDescription('Toggles the anti-spam system on or off.')
            .addBooleanOption(option => option.setName('state').setDescription('The new state of the anti-spam system.').setRequired(true)))
        .addSubcommand(subcommand => subcommand.setName('antiphishing').setDescription('Toggles the anti-phishing system on or off.')
            .addBooleanOption(option => option.setName('state').setDescription('The new state of the anti-phishing system.').setRequired(true))),
    execute: async (interaction) => {
        const subcommand = interaction.options.getSubcommand();
        const state = interaction.options.getBoolean('state');
        const system = subcommand === 'antispam' ? 'antiSpam' : 'antiPhishing';
        const title = `Anti-${subcommand.charAt(0).toUpperCase() + subcommand.slice(1)} Toggled`;
        const logChannel = interaction.guild.channels.cache.find(c => c.name.includes("mod-logs")) || interaction.channel;

        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageMessages))
            return r(interaction, "I need `MANAGE_MESSAGES` permissions for the anti-spam system.").then(() => delr(interaction, 7500));

        const embed = new EmbedBuilder()
            .setColor("#0efefe")
            .setTitle(title)
            .setThumbnail(interaction.user.displayAvatarURL())
            .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp()
            .addFields({
                name: '__**State**__',
                value: `${state}`,
                inline: true
            }, {
                name: '__**Moderator**__',
                value: `${interaction.user}`,
                inline: true
            });

        await db.updateOne({ guildID: interaction.guild.id }, {
            $set: { [system]: state }
        });

        s(logChannel, '', embed);
        return r(interaction, `The anti-spam system has been toggled to ${state}.`).then(() => delr(interaction, 7500));
    },
};