import { GuildMember, Client, EmbedBuilder, PermissionFlagsBits, TextChannel } from "discord.js";
import { updateActivities } from "../../utils/activityUtils";
import { sendMessage } from "../../utils/messageUtils";
import { GuildConfig } from "../../models/GuildConfig";

export default {
    name: "guildMemberAdd",
    async execute(client: Client, member: GuildMember) {
        updateActivities(client);

        const memberLogsChannel = member.guild.channels.cache.find(c => c.name.includes("member-logs")) as TextChannel;
        const modLogsChannel = member.guild.channels.cache.find(c => c.name.includes("mod-logs")) as TextChannel;
        const logChannel = memberLogsChannel || modLogsChannel;

        if (!logChannel || member.user.id === client.user?.id) return;

        const guildID = member.guild.id;
        const currentDate = new Date();
        const userJoinDate = member.user.createdAt;
        const time = currentDate.getTime() - userJoinDate.getTime();
        const userJoinTimestamp = Math.floor(member.user.createdAt.getTime() / 1000);
        const ONE_MONTH_IN_MS = 2629746000;

        const embed = new EmbedBuilder()
            .setColor("#0efefe")
            .setTitle("Member Joined")
            .setThumbnail(member.user.displayAvatarURL())
            .setDescription(`${member.user} (${member.user.id})`)
            .setFooter({ text: `${member.user.tag}`, iconURL: member.user.displayAvatarURL() })
            .setTimestamp()
            .addFields({ name: `${time <= ONE_MONTH_IN_MS ? "**Warning**" : ""} Account Created:`, value: `<t:${userJoinTimestamp}:R>` });

        await sendMessage(logChannel, { embeds: [embed] });

        const exists = await GuildConfig.findOne({ guildID: guildID });
        if (!exists || !exists.channels.find(ch => ch.command === "welcome") || !(exists.welcomeMessage.length > 0)) return;

        const welcomeCH = await member.guild.channels.fetch(exists.channels.find(ch => ch.command === "welcome")?.channelID || "").catch(() => null) as TextChannel;
        if (!welcomeCH || !member.guild.members.me?.permissionsIn(welcomeCH)?.has(PermissionFlagsBits.SendMessages)) return;

        const welcomeMSG = exists.welcomeMessage.toString().replace(/\[user\]/g, `${member.user}`);

        if (welcomeCH && welcomeMSG)
            sendMessage(welcomeCH, { content: welcomeMSG }).catch(error => sendMessage(logChannel, { content: `There was an error in sending a welcome message: ${error}` }));
    },
};