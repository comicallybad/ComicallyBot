import {
    SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChatInputCommandInteraction,
    GuildMember, InteractionContextType, MessageFlags
} from "discord.js";
import { sendReply } from "../../utils/replyUtils";
import { sendMessage } from "../../utils/messageUtils";
import { getLogChannel } from "../../utils/channelUtils";
import { ValidationError } from "../../utils/customErrors";

export default {
    data: new SlashCommandBuilder()
        .setName("report")
        .setDescription("Reports a member.")
        .setContexts(InteractionContextType.Guild)
        .addUserOption(option => option.setName("member").setDescription("The member to report").setRequired(true))
        .addStringOption(option => option.setName("reason").setDescription("The reason for the report").setMaxLength(1024).setRequired(true)),
    execute: async (interaction: ChatInputCommandInteraction) => {
        const rMember = interaction.options.getMember("member") as GuildMember;
        const reason = interaction.options.getString("reason", true);

        if (!rMember || !rMember.user.id) {
            throw new ValidationError("Please provide a member to report.");
        }

        if (rMember.permissions.has(PermissionFlagsBits.BanMembers) || rMember.user.bot) {
            throw new ValidationError("Cannot report that member.");
        }

        const logChannel = getLogChannel(interaction.guild!, ["reports", "mod-logs"]);

        if (!logChannel) {
            throw new ValidationError("Couldn't find a `#reports` or `#mod-logs` channel");
        }

        const embed = new EmbedBuilder()
            .setColor("#FF0000")
            .setTitle("Member Reported")
            .setThumbnail(rMember.user.displayAvatarURL())
            .setFooter({ text: rMember.user.tag, iconURL: rMember.user.displayAvatarURL() })
            .setTimestamp()
            .addFields(
                { name: "__**Target**__", value: `${rMember}`, inline: true },
                { name: "__**Reason**__", value: `${reason}`, inline: true },
                { name: "__**Reporter**__", value: `${interaction.user}`, inline: true }
            );

        await sendMessage(logChannel, { embeds: [embed] });
        await sendReply(interaction, { content: "Report has been filed.", flags: MessageFlags.Ephemeral });
    },
};