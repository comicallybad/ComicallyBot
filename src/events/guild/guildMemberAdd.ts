import { GuildMember, Client, EmbedBuilder, PermissionFlagsBits, TextChannel } from "discord.js";
import { updateActivities } from "../../utils/activityUtils";
import { sendMessage } from "../../utils/messageUtils";
import { GuildConfig } from "../../models/GuildConfig";
import { getLogChannel } from "../../utils/channelUtils";

export default {
    name: "guildMemberAdd",
    async execute(client: Client, member: GuildMember) {
        updateActivities(client);

        const { guild, user } = member;
        const logChannel = getLogChannel(guild, ["member-logs", "mod-logs"]);

        if (!logChannel || user.id === client.user?.id) return;

        const currentDate = new Date();
        const userJoinDate = user.createdAt;
        const timeSinceCreation = currentDate.getTime() - userJoinDate.getTime();
        const userJoinTimestamp = Math.floor(user.createdAt.getTime() / 1000);
        const ONE_MONTH_IN_MS = 2629746000;

        const embed = new EmbedBuilder()
            .setColor("#0efefe")
            .setTitle("Member Joined")
            .setThumbnail(user.displayAvatarURL())
            .setDescription(`${user} (${user.id})`)
            .setFooter({ text: `${user.tag}`, iconURL: user.displayAvatarURL() })
            .setTimestamp()
            .addFields({ name: `${timeSinceCreation <= ONE_MONTH_IN_MS ? "**Warning**" : ""} Account Created:`, value: `<t:${userJoinTimestamp}:R>` });

        await sendMessage(logChannel, { embeds: [embed] });

        const guildConfig = await GuildConfig.findOne({ guildID: guild.id });
        if (!guildConfig || !guildConfig.welcomeMessage || guildConfig.welcomeMessage.length === 0) return;

        const welcomeChannelConfig = guildConfig.channels.find((ch: { command: string; channelID: string }) => ch.command === "welcome");
        if (!welcomeChannelConfig) return;

        const welcomeChannel = await guild.channels.fetch(welcomeChannelConfig.channelID).catch(() => null) as TextChannel;
        if (!welcomeChannel || !guild.members.me?.permissionsIn(welcomeChannel)?.has(PermissionFlagsBits.SendMessages)) return;

        const welcomeMessageContent = guildConfig.welcomeMessage.toString().replace(/<user>/g, `${user}`);

        await sendMessage(welcomeChannel, { content: welcomeMessageContent });
    },
};