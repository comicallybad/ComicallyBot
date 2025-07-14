import { GuildAuditLogsEntry, Client, EmbedBuilder, AuditLogEvent, Guild, TextChannel, ColorResolvable } from "discord.js";
import { sendMessage } from "../../utils/messageUtils";

export default {
    name: "guildAuditLogEntryCreate",
    async execute(client: Client, auditLog: GuildAuditLogsEntry, guild: Guild) {
        const { action, executorId, targetId, changes } = auditLog;
        let timeoutDuration: number | undefined;
        let timeoutEnd: Date | undefined;

        interface ActionMapEntry {
            color: ColorResolvable;
            title: string;
            actionText: string;
        }

        const actionMap: Partial<Record<AuditLogEvent, ActionMapEntry>> = {
            [AuditLogEvent.GuildUpdate]: { color: "#0EFEFE", title: "Guild Updated", actionText: "Updated" },
            [AuditLogEvent.ChannelCreate]: { color: "#00FF00", title: "Channel Created", actionText: "Created" },
            [AuditLogEvent.ChannelUpdate]: { color: "#0EFEFE", title: "Channel Updated", actionText: "Updated" },
            [AuditLogEvent.ChannelDelete]: { color: "#FF0000", title: "Channel Deleted", actionText: "Deleted" },
            [AuditLogEvent.ChannelOverwriteCreate]: { color: "#00FF00", title: "Channel Overwrite Created", actionText: "Created" },
            [AuditLogEvent.ChannelOverwriteUpdate]: { color: "#0EFEFE", title: "Channel Overwrite Updated", actionText: "Updated" },
            [AuditLogEvent.ChannelOverwriteDelete]: { color: "#FF0000", title: "Channel Overwrite Deleted", actionText: "Deleted" },
            [AuditLogEvent.MemberKick]: { color: "#FF0000", title: "Member Kicked", actionText: "Kicked" },
            [AuditLogEvent.MemberPrune]: { color: "#FF0000", title: "Member Pruned", actionText: "Pruned" },
            [AuditLogEvent.MemberBanAdd]: { color: "#FF0000", title: "Member Banned", actionText: "Banned" },
            [AuditLogEvent.MemberBanRemove]: { color: "#00FF00", title: "Member Unbanned", actionText: "Unbanned" },
            [AuditLogEvent.MemberUpdate]: { color: "#0EFEFE", title: "", actionText: "" }, // Dynamically set for timeout
            [AuditLogEvent.MemberRoleUpdate]: { color: "#0EFEFE", title: "Member Role Updated", actionText: "Updated" },
            [AuditLogEvent.MemberMove]: { color: "#0EFEFE", title: "Member Moved", actionText: "Moved" },
            [AuditLogEvent.MemberDisconnect]: { color: "#FF0000", title: "Member Disconnected", actionText: "Disconnected" },
            [AuditLogEvent.BotAdd]: { color: "#00FF00", title: "Bot Added", actionText: "Added" },
            [AuditLogEvent.RoleCreate]: { color: "#00FF00", title: "Role Created", actionText: "Created" },
            [AuditLogEvent.RoleUpdate]: { color: "#0EFEFE", title: "Role Updated", actionText: "Updated" },
            [AuditLogEvent.RoleDelete]: { color: "#FF0000", title: "Role Deleted", actionText: "Deleted" },
            [AuditLogEvent.InviteCreate]: { color: "#00FF00", title: "Invite Created", actionText: "Created" },
            [AuditLogEvent.InviteUpdate]: { color: "#0EFEFE", title: "Invite Updated", actionText: "Updated" },
            [AuditLogEvent.InviteDelete]: { color: "#FF0000", title: "Invite Deleted", actionText: "Deleted" },
            [AuditLogEvent.WebhookCreate]: { color: "#00FF00", title: "Webhook Created", actionText: "Created" },
            [AuditLogEvent.WebhookUpdate]: { color: "#0EFEFE", title: "Webhook Updated", actionText: "Updated" },
            [AuditLogEvent.WebhookDelete]: { color: "#FF0000", title: "Webhook Deleted", actionText: "Deleted" },
            [AuditLogEvent.EmojiCreate]: { color: "#00FF00", title: "Emoji Created", actionText: "Created" },
            [AuditLogEvent.EmojiUpdate]: { color: "#0EFEFE", title: "Emoji Updated", actionText: "Updated" },
            [AuditLogEvent.EmojiDelete]: { color: "#FF0000", title: "Emoji Deleted", actionText: "Deleted" },
            [AuditLogEvent.MessageDelete]: { color: "#FF0000", title: "Message Deleted", actionText: "Deleted" },
            [AuditLogEvent.MessageBulkDelete]: { color: "#FF0000", title: "Bulk Messages Deleted", actionText: "Bulk Deleted" },
            [AuditLogEvent.MessagePin]: { color: "#00FF00", title: "Message Pinned", actionText: "Pinned" },
            [AuditLogEvent.MessageUnpin]: { color: "#FF0000", title: "Message Unpinned", actionText: "Unpinned" },
            [AuditLogEvent.IntegrationCreate]: { color: "#00FF00", title: "Integration Created", actionText: "Created" },
            [AuditLogEvent.IntegrationUpdate]: { color: "#0EFEFE", title: "Integration Updated", actionText: "Updated" },
            [AuditLogEvent.IntegrationDelete]: { color: "#FF0000", title: "Integration Deleted", actionText: "Deleted" },
            [AuditLogEvent.StageInstanceCreate]: { color: "#00FF00", title: "Stage Instance Created", actionText: "Created" },
            [AuditLogEvent.StageInstanceUpdate]: { color: "#0EFEFE", title: "Stage Instance Updated", actionText: "Updated" },
            [AuditLogEvent.StageInstanceDelete]: { color: "#FF0000", title: "Stage Instance Deleted", actionText: "Deleted" },
            [AuditLogEvent.StickerCreate]: { color: "#00FF00", title: "Sticker Created", actionText: "Created" },
            [AuditLogEvent.StickerUpdate]: { color: "#0EFEFE", title: "Sticker Updated", actionText: "Updated" },
            [AuditLogEvent.StickerDelete]: { color: "#FF0000", title: "Sticker Deleted", actionText: "Deleted" },
            [AuditLogEvent.GuildScheduledEventCreate]: { color: "#00FF00", title: "Scheduled Event Created", actionText: "Created" },
            [AuditLogEvent.GuildScheduledEventUpdate]: { color: "#0EFEFE", title: "Scheduled Event Updated", actionText: "Updated" },
            [AuditLogEvent.GuildScheduledEventDelete]: { color: "#FF0000", title: "Scheduled Event Deleted", actionText: "Deleted" },
            [AuditLogEvent.ThreadCreate]: { color: "#00FF00", title: "Thread Created", actionText: "Created" },
            [AuditLogEvent.ThreadDelete]: { color: "#FF0000", title: "Thread Deleted", actionText: "Deleted" },
            [AuditLogEvent.ThreadUpdate]: { color: "#0EFEFE", title: "Thread Updated", actionText: "Updated" },
            [AuditLogEvent.ApplicationCommandPermissionUpdate]: { color: "#0EFEFE", title: "Application Command Permission Updated", actionText: "Updated" },
            [AuditLogEvent.AutoModerationRuleCreate]: { color: "#00FF00", title: "Auto Moderation Rule Created", actionText: "Created" },
            [AuditLogEvent.AutoModerationRuleUpdate]: { color: "#0EFEFE", title: "Auto Moderation Rule Updated", actionText: "Updated" },
            [AuditLogEvent.AutoModerationRuleDelete]: { color: "#FF0000", title: "Auto Moderation Rule Deleted", actionText: "Deleted" },
            [AuditLogEvent.AutoModerationBlockMessage]: { color: "#FF0000", title: "Auto Moderation Block Message", actionText: "Blocked" },
            [AuditLogEvent.AutoModerationFlagToChannel]: { color: "#FF0000", title: "Auto Moderation Flagged to Channel", actionText: "Flagged" },
            [AuditLogEvent.AutoModerationUserCommunicationDisabled]: { color: "#FF0000", title: "Auto Moderation User Communication Disabled", actionText: "Disabled" },
            [AuditLogEvent.CreatorMonetizationRequestCreated]: { color: "#00FF00", title: "Creator Monetization Request Created", actionText: "Created" },
            [AuditLogEvent.CreatorMonetizationTermsAccepted]: { color: "#00FF00", title: "Creator Monetization Terms Accepted", actionText: "Accepted" },
        };

        //Handle member timeout mapping
        if (action === AuditLogEvent.MemberUpdate) {
            const timeoutChange = changes?.find(change => change.key === 'communication_disabled_until');
            if (!timeoutChange) return;

            if (timeoutChange.new) {
                actionMap[action] = { color: "#FF0000", title: "Member Timed Out", actionText: "Timed Out" };

                timeoutEnd = new Date(timeoutChange.new as string);
                const now = new Date();
                timeoutDuration = Math.round((timeoutEnd.getTime() - now.getTime()) / 60000);
            } else {
                actionMap[action] = { color: "#00FF00", title: "Member Timeout Removed", actionText: "Timeout Removed" };
            }
        }

        if (!actionMap[action]) return;

        const actionChannel = guild.channels.cache.find(c => c.name.includes("action-logs")) as TextChannel;
        if (!actionChannel) return;

        const reason = auditLog.reason || 'No reason provided.';
        const executor = executorId ? await client.users.fetch(executorId).catch(() => null) : null;
        const target = targetId ? await client.users.fetch(targetId).catch(() => null) : null;

        const embed = new EmbedBuilder()
            .setColor(actionMap[action]!.color)
            .setTitle(actionMap[action]!.title)
            .setThumbnail(target?.displayAvatarURL() || executor?.displayAvatarURL() || '')
            .setFooter({
                text: `${target ? target.tag : executor?.tag || 'Unknown'} | ${target ? target.id : executor?.id || 'Unknown'}`,
                iconURL: target?.displayAvatarURL() || executor?.displayAvatarURL() || '',
            })
            .setTimestamp();

        //Handle timeout, kick, ban, and unban
        if (target && executor) {
            //Ignore bot actions (logged during command execution)
            if (executor.id === client.user?.id) return;
            embed.addFields({
                name: "__**Target**__",
                value: `${target}`,
                inline: true,
            }, {
                name: `__**Reason**__`,
                value: `${reason}`,
                inline: true,
            }, {
                name: "__**Moderator**__",
                value: `${executor}`,
                inline: true
            });
        }

        //Handle timeout fields
        if (timeoutDuration) {
            embed.addFields({
                name: "__**Removes**__",
                value: `<t:${Math.floor((timeoutEnd?.getTime() || 0) / 1000)}:R>`,
                inline: true
            }, {
                name: "__**Lasts Until**__",
                value: `<t:${Math.floor((timeoutEnd?.getTime() || 0) / 1000)}:f>`,
                inline: true
            });
        }

        //Handle invite fields
        if (action === AuditLogEvent.InviteCreate || action === AuditLogEvent.InviteUpdate || action === AuditLogEvent.InviteDelete) {
            const inviteChange = changes?.find(change => change.key === 'code');
            if (!inviteChange) return;

            const inviteCode = inviteChange.new || inviteChange.old;
            const channelIdChange = changes?.find(change => change.key === 'channel_id');
            const channelId = channelIdChange ? (channelIdChange.new || channelIdChange.old) : null;
            const inviterIdChange = changes?.find(change => change.key === 'inviter_id');
            const inviterId = inviterIdChange ? (inviterIdChange.new || inviterIdChange.old) : null;
            const maxUsesChange = changes?.find(change => change.key === 'max_uses');
            const maxUses = maxUsesChange ? (maxUsesChange.old || maxUsesChange.new) : null;
            const usesChange = changes?.find(change => change.key === 'uses');
            const uses = usesChange ? (usesChange.old || usesChange.new) : null;
            const maxAgeChange = changes?.find(change => change.key === 'max_age');
            const maxAge = maxAgeChange ? (maxAgeChange.new || maxAgeChange.old) : null;

            const channel = channelId ? await client.channels.fetch(channelId as string).catch(() => null) : null;
            const inviter = inviterId ? await client.users.fetch(inviterId as string).catch(() => null) : null;

            embed.addFields({
                name: "__**Invite**__",
                value: `[${inviteCode}](https://discord.gg/${inviteCode})`,
                inline: true,
            }, {
                name: "__**Channel**__",
                value: `${channel ? `<#${channel.id}>` : "Unknown Channel"}`,
                inline: true,
            }, {
                name: "__**Inviter**__",
                value: `${inviter ? `<@${inviter.id}>` : "Unknown Inviter"}`,
                inline: true,
            }).addFields({
                name: "__**Expires**__",
                value: `${maxAge ? `<t:${Math.floor((Date.now() + (maxAge as number) * 1000) / 1000)}:R>` : "Never expires"}`,
                inline: true
            }, {
                name: "__**Max Uses**__",
                value: `${maxUses ? `${maxUses}` : "Unlimited"}`,
                inline: true
            }, {
                name: "__**Uses**__",
                value: uses ? `${uses}` : "0",
                inline: true
            });
        }

        return await sendMessage(actionChannel, { embeds: [embed] });
    },
};