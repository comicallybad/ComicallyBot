const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { r, re, delr } = require("../../../utils/functions/functions.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('who-is')
        .setDescription('Returns user information.')
        .addUserOption(option => option.setName('user').setDescription('The user to check').setRequired(false)),
    execute: (interaction) => {
        let member;
        if (interaction.options.getUser('user'))
            member = interaction.guild.members.cache.get(interaction.options.getUser('user').id);
        else member = interaction.member;

        if (!member)
            return re(interaction, "Sorry, this user either doesn't exist, or they are not in the discord.").then(() => delr(interaction, 7500));

        const joinedTimestamp = Math.floor(member.joinedAt.getTime() / 1000);
        const roles = member.roles.cache.filter(r => r.id !== interaction.guild.id).map(r => r).join(", ") || 'none';
        const created = Math.floor(member.user.createdAt.getTime() / 1000);

        const embed = new EmbedBuilder()
            .setTitle(member.user.username)
            .setFooter({ text: member.displayName, iconURL: member.user.displayAvatarURL() })
            .setThumbnail(member.user.displayAvatarURL())
            .setColor(member.displayHexColor === '#000000' ? '#ffffff' : member.displayHexColor)
            .addFields({
                name: '__**Member information:**__',
                value: `**Display name:** \`${member.displayName}\`
                **Joined:** <t:${joinedTimestamp}:f>
                **Roles:** ${roles}`
            })
            .addFields({
                name: '__**User information:**__',
                value: `**ID:** \`${member.user.id}\`
                **Username:** \`${member.user.username}\`
                **Tag:** \`${member.user.tag}\`
                **Account Created:** <t:${created}:R>`
            })
            .setTimestamp();

        return r(interaction, "", embed).then(() => delr(interaction, 30000));
    }
}