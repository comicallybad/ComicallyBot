const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { r, re, delr, pageList } = require("../../../utils/functions/functions.js");
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('invites')
        .setDescription('Provides server invite links.'),
    execute: async (interaction) => {
        if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ViewAuditLog))
            return re(interaction, `There was an error fetching invites. I need VIEW_AUDIT_LOG permissions for this command.`).then(() => delr(interaction, 7500));

        const amount = await interaction.guild.invites.fetch().then(invites => invites.size).catch(err => { return -1 });

        if (amount == -1)
            return re(interaction, `There was an error fetching invites.`).then(() => delr(interaction, 7500));

        if (!(amount > 0))
            return re(interaction, "There are no server invites created.").then(() => delr(interaction, 7500));

        const invites = await interaction.guild.invites.fetch().then(invites => invites.sort((x, y) => { return y.uses - x.uses }).map(invite => {
            if (invite.inviter) return `\`${invite.code}\` made by **${invite.inviter.username}** with \`${invite.uses}\` uses.`
        }));

        const embed = new EmbedBuilder()
            .setTitle("Server Invites")
            .setColor("#0efefe")
            .setTimestamp();

        if (invites.length > 10) {
            await r(interaction, "", embed)
            pageList(interaction, invites, embed, "Invite #", 10, 0);
        } else {
            invites.forEach((invite, index) => {
                embed.addFields({ name: `Invite #${index + 1}:`, value: `${invite}` });
            });
            return r(interaction, "", embed).then(() => delr(interaction, 30000));
        }
    }
};