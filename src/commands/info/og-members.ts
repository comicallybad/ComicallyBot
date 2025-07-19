import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, InteractionContextType } from "discord.js";
import { sendReply, deleteReply } from "../../utils/replyUtils";
import { pageList } from "../../utils/paginationUtils";

export default {
    data: new SlashCommandBuilder()
        .setName("og-members")
        .setDescription("Shows a list of earliest users in the discord server.")
        .setContexts(InteractionContextType.Guild),
    async execute(interaction: ChatInputCommandInteraction) {
        const guild = interaction.guild!;

        const date = new Date();
        const sortedMembers = guild.members.cache.sort((a, b) => (a.joinedAt?.getTime() || 0) - (b.joinedAt?.getTime() || 0));
        const membersArray: string[] = sortedMembers.map(member => {
            const joinedTimestamp = member.joinedAt?.getTime();
            const daysAgo = joinedTimestamp ? Math.round((date.getTime() - joinedTimestamp) / 86400000) : "N/A";
            return `**${member.nickname ? member.nickname : member.user.username}** (\`${member.user.tag}\`)\n**Joined:** ${member.joinedAt?.toDateString()} (\`${daysAgo}\` **DAYS AGO!)**)`;
        });

        const embed = new EmbedBuilder()
            .setTitle("Top OG Members")
            .setDescription(`Member count: ${membersArray.length}`)
            .setColor("#0efefe")
            .setTimestamp();

        if (membersArray.length === 0) {
            embed.addFields({ name: "OG Members", value: "No members found." });
            await sendReply(interaction, { embeds: [embed] });
            await deleteReply(interaction, { timeout: 30000 });
        } else {
            await sendReply(interaction, { embeds: [embed] });
            await pageList(interaction, membersArray, embed, "OG Member #", 10, 0);
        }
    }
};