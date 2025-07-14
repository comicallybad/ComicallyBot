import {
    SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChatInputCommandInteraction,
    GuildMember, TextChannel, InteractionContextType, ChannelType
} from "discord.js";
import { sendReply, deleteReply } from "../../utils/replyUtils";
import { sendMessage } from "../../utils/messageUtils";
import { getLogChannel } from "../../utils/channelUtils";
import { PermissionError, ValidationError } from "../../utils/customErrors";

export default {
    data: new SlashCommandBuilder()
        .setName("warn")
        .setDescription("Warns a member.")
        .setContexts(InteractionContextType.Guild)
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option => option.setName("member").setDescription("The member to warn").setRequired(true))
        .addStringOption(option => option.setName("reason").setDescription("The reason for the warning").setMaxLength(1024).setRequired(true))
        .addChannelOption(option => option.setName("channel").setDescription("The channel the warning was issued in").addChannelTypes(ChannelType.GuildText)),

    execute: async (interaction: ChatInputCommandInteraction) => {
        const wMember = interaction.options.getMember("member") as GuildMember;
        const reason = interaction.options.getString("reason", true);
        const channel = interaction.options.getChannel("channel") as TextChannel | undefined;

        if (!interaction.guild?.members.me?.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            throw new PermissionError("I don't have permission to `Moderate Members`.");
        }

        if (wMember.permissions.has(PermissionFlagsBits.Administrator) || wMember.user.bot) {
            throw new ValidationError("Cannot warn that member.");
        }

        const logChannel = getLogChannel(interaction.guild!, ["action-logs", "mod-logs"]);

        if (!logChannel) {
            throw new ValidationError("Couldn't find a `#action-logs` or `#mod-logs` channel");
        }

        const embed = new EmbedBuilder()
            .setColor("#FF0000")
            .setTitle("Member Warned")
            .setThumbnail(wMember.user.displayAvatarURL())
            .setFooter({ text: wMember.user.tag, iconURL: wMember.user.displayAvatarURL() })
            .setTimestamp()
            .addFields({
                name: "__**Target**__",
                value: `${wMember}`,
                inline: true
            }, {
                name: "__**Reason**__",
                value: `${reason}`,
                inline: true

            }, {
                name: "__**Moderator**__",
                value: `${interaction.user}`,
                inline: true
            });

        const warnEmbed = new EmbedBuilder()
            .setColor("#FF0000")
            .setTitle("You have been warned!")
            .setThumbnail(wMember.user.displayAvatarURL())
            .setFooter({ text: wMember.user.tag, iconURL: wMember.user.displayAvatarURL() })
            .setTimestamp()
            .addFields({
                name: "__**Member**__",
                value: `${wMember}`,
                inline: true
            }, {
                name: "__**Reason**__",
                value: `${reason}`,
                inline: true
            });

        if (channel) {
            await sendMessage(channel, { embeds: [warnEmbed.toJSON()] });
        } else if (interaction.channel) {
            await sendMessage(interaction.channel as TextChannel, { embeds: [warnEmbed.toJSON()] });
        }

        if (logChannel) {
            await sendMessage(logChannel, { embeds: [embed.toJSON()] });
        }

        await sendReply(interaction, { content: "Warning has been issued." });
        await deleteReply(interaction, { timeout: 7500 });
    },
};