import {
    SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType, ChatInputCommandInteraction,
    MessageFlags, ActionRowBuilder, ButtonBuilder, ButtonStyle, ButtonInteraction, GuildMember
} from "discord.js";
import { sendReply, deleteReply } from "../../utils/replyUtils";
import { sendMessage } from "../../utils/messageUtils";
import { GuildConfig } from "../../models/GuildConfig";
import { ValidationError } from "../../utils/customErrors";
import { messagePrompt } from "../../utils/paginationUtils";
import { getLogChannel } from "../../utils/channelUtils";

export default {
    data: new SlashCommandBuilder()
        .setName('welcome-channel')
        .setDescription('Manage the welcome channel.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addSubcommand(subcommand => subcommand.setName('get').setDescription('Get the current welcome channel.'))
        .addSubcommand(subcommand => subcommand.setName('set').setDescription('Set a new welcome channel.')
            .addChannelOption(option =>
                option.setName('channel').setDescription('The channel to set as the welcome channel.').setRequired(true).addChannelTypes(ChannelType.GuildText)))
        .addSubcommand(subcommand => subcommand.setName('remove').setDescription('Remove the current welcome channel.')),
    async execute(interaction: ChatInputCommandInteraction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "get") return await getWelcomeChannel(interaction);
        else if (subcommand === "set") return await setWelcomeChannel(interaction);
        else if (subcommand === "remove") return await removeWelcomeChannel(interaction);
    }
};

async function getWelcomeChannel(interaction: ChatInputCommandInteraction) {
    const guildID = interaction.guild!.id;
    if (!guildID) return;

    const dbResult = await GuildConfig.findOne({ guildID: guildID, "channels.command": "welcome" });

    if (!dbResult || !dbResult.channels.length) {
        await sendReply(interaction, { content: "There has been no welcome channel set.", flags: MessageFlags.Ephemeral });
        return;
    }

    const welcomeChannelData = dbResult.channels.find((ch: any) => ch.command === "welcome");
    if (!welcomeChannelData) {
        throw new ValidationError("There has been no welcome channel set.");
    }

    const channel = await interaction.guild?.channels.fetch(welcomeChannelData.channelID);
    if (!channel) {
        throw new ValidationError("The welcome channel could not be found in this server.");
    }

    await sendReply(interaction, { content: `The current welcome channel is set to: ${channel}` });
    await deleteReply(interaction, { timeout: 30000 });
    return;
}

async function setWelcomeChannel(interaction: ChatInputCommandInteraction) {
    const channel = interaction.options.getChannel('channel');

    if (!channel || channel.type !== ChannelType.GuildText) {
        throw new ValidationError("Please provide a valid text channel.");
    }

    const logChannel = getLogChannel(interaction.guild!, ["mod-logs"]);
    const guildID = interaction.guildId;
    if (!guildID) return;

    if (!interaction.guild?.channels.cache.has(channel.id)) {
        throw new ValidationError("Channel not found in this server.");
    }

    const dbResult = await GuildConfig.findOne({ guildID: guildID });

    const embed = new EmbedBuilder()
        .setColor("#0efefe")
        .setTitle("Welcome Channel Set")
        .setThumbnail(interaction.user.displayAvatarURL())
        .setFooter({ text: (interaction.member as GuildMember)?.displayName || interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
        .setTimestamp()
        .addFields(
            { name: '__**Channel**__', value: `<#${channel.id}>`, inline: true },
            { name: '__**Moderator**__', value: `${interaction.user}`, inline: true }
        );

    if (!dbResult?.channels.some((ch: any) => ch.command === "welcome")) {
        await GuildConfig.updateOne({ guildID: guildID }, {
            $push: { channels: { command: "welcome", channelID: channel.id, channelName: channel.name } }
        }, { upsert: true });
    } else {
        embed.setTitle("Welcome Channel Changed");
        await GuildConfig.updateOne({ guildID: guildID, 'channels.command': "welcome" }, {
            $set: { 'channels.$.channelID': channel.id, 'channels.$.channelName': channel.name }
        });
    }

    await sendReply(interaction, { content: dbResult ? "Updated welcome channel." : "Welcome channel has been set." });
    await deleteReply(interaction, { timeout: 30000 });
    if (logChannel) await sendMessage(logChannel, { embeds: [embed] });
    return;
}

async function removeWelcomeChannel(interaction: ChatInputCommandInteraction) {
    const guildID = interaction.guild!.id;
    if (!guildID) return;

    const dbResult = await GuildConfig.findOne({ guildID: guildID, "channels.command": "welcome" });

    if (!dbResult || !dbResult.channels.length) {
        throw new ValidationError("The welcome channel has not been set.");
    }

    const promptEmbed = new EmbedBuilder()
        .setColor("#FF0000")
        .setAuthor({ name: `This verification becomes invalid after 30s.`, iconURL: interaction.user.displayAvatarURL() })
        .setDescription(`Do you want to remove the welcome channel?`);

    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder().setCustomId("confirm").setLabel("Confirm").setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId("cancel").setLabel("Cancel").setStyle(ButtonStyle.Danger)
        );

    await sendReply(interaction, { embeds: [promptEmbed], components: [row] });

    try {
        const collected = await messagePrompt(interaction, row, 30000) as ButtonInteraction;

        if (collected.customId === "cancel") {
            await sendReply(collected, { content: "Selection cancelled.", flags: MessageFlags.Ephemeral });
            await deleteReply(interaction, { timeout: 0 });
            return;
        }

        if (collected.customId === "confirm") {
            await GuildConfig.updateOne({ guildID: guildID }, {
                $pull: { channels: { command: "welcome" } }
            });

            const logChannel = getLogChannel(interaction.guild!, ["mod-logs"]);
            const embed = new EmbedBuilder()
                .setColor("#0efefe")
                .setTitle("Welcome Channel Removed")
                .setThumbnail(interaction.user.displayAvatarURL())
                .setFooter({ text: (interaction.member as GuildMember)?.displayName || interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp()
                .addFields({ name: '__**Moderator**__', value: `${interaction.user}`, inline: true });

            await sendReply(collected, { content: "The welcome channel has been removed.", flags: MessageFlags.Ephemeral });
            await deleteReply(interaction, { timeout: 0 });
            if (logChannel) await sendMessage(logChannel, { embeds: [embed] });
            return;
        }
    } catch (err: unknown) {
        if (err === "time") {
            await deleteReply(interaction, { timeout: 0 });
            throw new ValidationError("Prompt timed out.");
        } else {
            throw err;
        }
    }
}