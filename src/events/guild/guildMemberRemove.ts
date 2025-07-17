import { GuildMember, Client, EmbedBuilder } from "discord.js";
import { updateActivities } from "../../utils/activityUtils";
import { sendMessage } from "../../utils/messageUtils";
import humanizeDuration from "humanize-duration";
import { getLogChannel } from "../../utils/channelUtils";

export default {
    name: "guildMemberRemove",
    async execute(client: Client, member: GuildMember) {
        updateActivities(client);

        const logChannel = getLogChannel(member.guild, ["member-logs", "mod-logs"]);

        if (!logChannel || member.user.id === client.user?.id) return;

        const currentDate = new Date();
        const timeInServer = currentDate.getTime() - (member.joinedAt?.getTime() || 0);
        const durationInServer = humanizeDuration(timeInServer, { round: true });

        const embed = new EmbedBuilder()
            .setColor("#0EFEFE")
            .setTitle("Member Left")
            .setThumbnail(member.user.displayAvatarURL())
            .setFooter({ text: `${member.user.tag}`, iconURL: member.user.displayAvatarURL() })
            .setTimestamp()
            .setDescription(`${member} (${member.id})`)
            .addFields({ name: 'Time in server:', value: `\`${durationInServer}\`` });

        return await sendMessage(logChannel, { embeds: [embed] });
    },
};