const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const { re, delr } = require("../../../utils/functions/functions.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('create-log-channels')
        .setDescription('Create log channels')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    execute: async (interaction) => {
        try {
            await createChannels(interaction);
            return re(interaction, "Log channels created successfully.").then(() => delr(interaction, 30000));
        } catch (err) {
            return re(interaction, `An error occurred while trying to create the log channels: \n\`${err}\``);
        }
    },
};

async function createChannels(interaction) {
    const everyoneRoleId = interaction.guild.roles.everyone.id;
    const channelNames = ["mod-logs", "member-logs", "role-logs", "text-logs", "action-logs", "reports"];
    const permissionOverwrites = [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AddReactions, PermissionFlagsBits.ManageMessages]
    let categoryChannel = interaction.guild.channels.cache.find(c => c.name.includes("Logging") && c.type === ChannelType.GuildCategory);

    if (!categoryChannel) {
        categoryChannel = await interaction.guild.channels.create({
            name: "📃︱Logging", type: ChannelType.GuildCategory,
            permissionOverwrites: [{ id: everyoneRoleId, deny: permissionOverwrites, },],
        });
    }

    for (const channelName of channelNames) {
        let channel = interaction.guild.channels.cache.find(c => c.name.includes(channelName));
        if (!channel) {
            channel = await interaction.guild.channels.create({
                name: `📃︱${channelName}`, type: ChannelType.GuildText, parent: categoryChannel,
                permissionOverwrites: [{ id: everyoneRoleId, deny: permissionOverwrites, },],
            });
        } else if (channel.parentId !== categoryChannel.id) {
            await channel.setParent(categoryChannel);
        }
    }
}