import { SlashCommandBuilder, EmbedBuilder, GuildMember, ChatInputCommandInteraction, RoleManager, InteractionContextType } from "discord.js";
import { sendReply, deleteReply } from "../../utils/replyUtils";
import { ValidationError } from "../../utils/customErrors";

export default {
    data: new SlashCommandBuilder()
        .setName("who-is")
        .setDescription("Returns user information.")
        .setContexts(InteractionContextType.Guild)
        .addUserOption(option => option.setName("user").setDescription("The user to check").setRequired(false)),
    execute: async (interaction: ChatInputCommandInteraction) => {
        const guild = interaction.guild!;

        const targetUser = interaction.options.getUser("user");
        const member = targetUser ? guild.members.cache.get(targetUser.id) : interaction.member;

        if (!member) {
            throw new ValidationError("Sorry, this user either doesn't exist, or they are not in the discord.");
        }

        if (!(member instanceof GuildMember)) {
            throw new ValidationError("Could not retrieve full member information.");
        }

        const joinedTimestamp = member.joinedAt ? Math.floor(member.joinedAt.getTime() / 1000) : "N/A";

        let roles = "none";
        if (member.roles instanceof RoleManager) {
            roles = member.roles.cache.filter(r => r.id !== interaction.guild!.id).map(r => r.toString()).join(", ") || "none";
        } else if (Array.isArray(member.roles)) {
            roles = member.roles.filter(roleId => roleId !== interaction.guild!.id).map(roleId => `<@&${roleId}>`).join(", ") || "none";
        }

        const created = Math.floor(member.user.createdAt.getTime() / 1000);

        const embed = new EmbedBuilder()
            .setTitle(member.user.username)
            .setFooter({ text: member.displayName, iconURL: member.user.displayAvatarURL() })
            .setThumbnail(member.user.displayAvatarURL())
            .setColor(member.displayHexColor === "#000000" ? "#ffffff" : member.displayHexColor)
            .addFields(
                {
                    name: "__**Member information:**__",
                    value: `**Display name:** \`${member.displayName}\`\n**Joined:** ${joinedTimestamp !== "N/A" ? `<t:${joinedTimestamp}:f>` : "N/A"}\n**Roles:** ${roles}`
                },
                {
                    name: "__**User information:**__",
                    value: `**ID:** \`${member.user.id}\`\n**Username:** \`${member.user.username}\`\n**Tag:** \`${member.user.tag}\`\n**Account Created:** <t:${created}:R>`
                }
            )
            .setTimestamp();

        await sendReply(interaction, { embeds: [embed.toJSON()] });
        await deleteReply(interaction, { timeout: 30000 });
    }
};