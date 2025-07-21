import { GuildAuditLogsEntry, Client, EmbedBuilder, AuditLogEvent, Guild, TextChannel, ColorResolvable, PermissionsBitField, ChannelType } from "discord.js";
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

        const channelTypeMap: { [key: number]: string } = {
            [ChannelType.GuildText]: 'Text',
            [ChannelType.GuildVoice]: 'Voice',
            [ChannelType.GuildCategory]: 'Category',
            [ChannelType.GuildAnnouncement]: 'Announcement',
            [ChannelType.GuildStageVoice]: 'Stage',
            [ChannelType.GuildDirectory]: 'Directory',
            [ChannelType.GuildForum]: 'Forum',
        };

        const permissionMap: { [key: string]: string } = {
            // General Guild Permissions
            CreateInstantInvite: 'Create Instant Invite',
            KickMembers: 'Kick Members',
            BanMembers: 'Ban Members',
            Administrator: 'Administrator',
            ManageChannels: 'Manage Channels',
            ManageGuild: 'Manage Guild',
            ViewAuditLog: 'View Audit Log',
            ViewGuildInsights: 'View Guild Insights',
            ManageRoles: 'Manage Roles',
            ManageWebhooks: 'Manage Webhooks',
            ManageEmojisAndStickers: 'Manage Emojis and Stickers',
            ManageGuildExpressions: 'Manage Expressions',
            ManageEvents: 'Manage Events',
            ManageThreads: 'Manage Threads',
            ViewCreatorMonetizationAnalytics: 'View Creator Monetization Analytics',
            UseExternalStatuses: 'Use External Statuses',
            // Membership Permissions
            ChangeNickname: 'Change Nickname',
            ManageNicknames: 'Manage Nicknames',
            ModerateMembers: 'Moderate Members',
            // Text Channel Permissions
            ViewChannel: 'View Channel',
            SendMessages: 'Send Messages',
            SendMessagesInThreads: 'Send Messages in Threads',
            CreatePublicThreads: 'Create Public Threads',
            CreatePrivateThreads: 'Create Private Threads',
            EmbedLinks: 'Embed Links',
            AttachFiles: 'Attach Files',
            AddReactions: 'Add Reactions',
            UseExternalEmojis: 'Use External Emojis',
            UseExternalStickers: 'Use External Stickers',
            MentionEveryone: 'Mention Everyone',
            ManageMessages: 'Manage Messages',
            ReadMessageHistory: 'Read Message History',
            SendTTSMessages: 'Send TTS Messages',
            UseApplicationCommands: 'Use Application Commands',
            // Voice Channel Permissions
            Connect: 'Connect',
            Speak: 'Speak',
            Stream: 'Stream',
            UseEmbeddedActivities: 'Use Embedded Activities',
            UseVoiceActivity: 'Use Voice Activity',
            PrioritySpeaker: 'Priority Speaker',
            MuteMembers: 'Mute Members',
            DeafenMembers: 'Deafen Members',
            MoveMembers: 'Move Members',
            RequestToSpeak: 'Request to Speak',
            // Other Permissions
            UseSoundboard: 'Use Soundboard',
            UseExternalSounds: 'Use External Sounds',
            SendVoiceMessages: 'Send Voice Messages',
        };

        //Handle member timeout mapping
        if (action === AuditLogEvent.MemberUpdate) {
            const timeoutChange = changes?.find(change => change.key === 'communication_disabled_until');
            if (timeoutChange) { // Ensure timeoutChange is not undefined
                if (timeoutChange.new) {
                    actionMap[action] = { color: "#FF0000", title: "Member Timed Out", actionText: "Timed Out" };

                    timeoutEnd = new Date(timeoutChange.new as string);
                    const now = new Date();
                    timeoutDuration = Math.round((timeoutEnd.getTime() - now.getTime()) / 60000);
                } else {
                    actionMap[action] = { color: "#00FF00", title: "Member Timeout Removed", actionText: "Timeout Removed" };
                }
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
                text: `${target ? target.tag : executor?.tag || 'Unknown'} | ${target ? target.id : executor?.id || 'Unknown'} `,
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
            const channelId = channelIdChange ? (channelIdChange.new as any || channelIdChange.old as any) : null;
            const inviterIdChange = changes?.find(change => change.key === 'inviter_id');
            const inviterId = inviterIdChange ? (inviterIdChange.new as any || inviterIdChange.old as any) : null;
            const maxUsesChange = changes?.find(change => change.key === 'max_uses');
            const maxUses = maxUsesChange ? (maxUsesChange.old as any || maxUsesChange.new as any) : null;
            const usesChange = changes?.find(change => change.key === 'uses');
            const uses = usesChange ? (usesChange.old as any || usesChange.new as any) : null;
            const maxAgeChange = changes?.find(change => change.key === 'max_age');
            const maxAge = maxAgeChange ? (maxAgeChange.new as any || maxAgeChange.old as any) : null;

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

        // Handle channel fields
        if (action === AuditLogEvent.ChannelCreate || action === AuditLogEvent.ChannelUpdate || action === AuditLogEvent.ChannelDelete ||
            action === AuditLogEvent.ChannelOverwriteCreate || action === AuditLogEvent.ChannelOverwriteUpdate || action === AuditLogEvent.ChannelOverwriteDelete) {

            const channel = targetId ? await client.channels.fetch(targetId).catch(() => null) : null;

            if (action === AuditLogEvent.ChannelCreate) {
                const nameChange = changes?.find(change => change.key === 'name');
                const name = nameChange ? (nameChange.new as any || nameChange.old as any) : null;

                const topicChange = changes?.find(change => change.key === 'topic');
                const topic = topicChange ? (topicChange.new as any || topicChange.old as any) : null;

                const nsfwChange = changes?.find(change => change.key === 'nsfw');
                const nsfw = nsfwChange ? (nsfwChange.new as any || nsfwChange.old as any) : null;

                const bitrateChange = changes?.find(change => change.key === 'bitrate');
                const bitrate = bitrateChange ? (bitrateChange.new as any || bitrateChange.old as any) : null;

                const userLimitChange = changes?.find(change => change.key === 'user_limit');
                const userLimit = userLimitChange ? (userLimitChange.new as any || userLimitChange.old as any) : null;

                embed.addFields({
                    name: "__**Channel Name**__",
                    value: `${name || (channel as TextChannel)?.name || 'Unknown'}`,
                    inline: true,
                }, {
                    name: "__**Channel Type**__",
                    value: `${channel ? channelTypeMap[channel.type] || 'Unknown' : 'Unknown'}`,
                    inline: true,
                });
                if (topic) {
                    embed.addFields({
                        name: "__**Topic**__",
                        value: `${topic}`,
                        inline: true,
                    });
                }
                if (nsfw !== null) {
                    embed.addFields({
                        name: "__**NSFW**__",
                        value: `${nsfw ? 'Yes' : 'No'}`,
                        inline: true,
                    });
                }
                if (bitrate) {
                    embed.addFields({
                        name: "__**Bitrate**__",
                        value: `${(bitrate as number) / 1000} kbps`,
                        inline: true,
                    });
                }
                if (userLimit) {
                    embed.addFields({
                        name: "__**User Limit**__",
                        value: `${userLimit}`,
                        inline: true,
                    });
                }
            } else if (action === AuditLogEvent.ChannelDelete) {
                const nameChange = changes?.find(change => change.key === 'name');
                const name = nameChange ? (nameChange.new as any || nameChange.old as any) : null;

                const typeChange = changes?.find(change => change.key === 'type');
                const type = typeChange ? (typeChange.new as any || typeChange.old as any) : null;

                embed.addFields({
                    name: "__**Channel Name**__",
                    value: `${name || 'Unknown'}`,
                    inline: true,
                }, {
                    name: "__**Channel Type**__",
                    value: `${(type !== null && typeof type === 'number' && channelTypeMap[type]) ? channelTypeMap[type] : 'Unknown'}`,
                    inline: true,
                });
            } else if (action === AuditLogEvent.ChannelUpdate) {
                if (channel) {
                    embed.addFields({
                        name: "__**Channel**__",
                        value: `<#${channel.id}>`,
                        inline: true,
                    });
                }
                for (const change of changes!) {
                    let oldValue: any = change.old;
                    let newValue: any = change.new;

                    if (change.key === 'type') {
                        oldValue = channelTypeMap[oldValue as number] || oldValue;
                        newValue = channelTypeMap[newValue as number] || newValue;

                    } else if (change.key === 'bitrate') {
                        oldValue = `${(oldValue as number) / 1000} kbps`;
                        newValue = `${(newValue as number) / 1000} kbps`;
                    } else if (change.key === 'nsfw') {
                        oldValue = oldValue ? 'Yes' : 'No';
                        newValue = newValue ? 'Yes' : 'No';
                    }

                    embed.addFields({
                        name: `__**${change.key.replace(/_/g, ' ').replace(/id/g, 'ID').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}**__`,
                        value: `Old: ${oldValue || 'None'}\nNew: ${newValue || 'None'}`,
                        inline: true,
                    });
                }
            } else if (action === AuditLogEvent.ChannelOverwriteCreate || action === AuditLogEvent.ChannelOverwriteUpdate || action === AuditLogEvent.ChannelOverwriteDelete) {
                const id = (auditLog.extra && typeof auditLog.extra === 'object' && 'id' in auditLog.extra) ? (auditLog.extra as { id: string }).id : (changes?.find(change => change.key === 'id')?.new || changes?.find(change => change.key === 'id')?.old);
                const type = changes?.find(change => change.key === 'type')?.new || changes?.find(change => change.key === 'type')?.old;

                const allowChange = changes?.find(change => change.key === 'allow');
                const allow = allowChange ? (allowChange.new as any || allowChange.old as any) : null;

                const denyChange = changes?.find(change => change.key === 'deny');
                const deny = denyChange ? (denyChange.new as any || denyChange.old as any) : null;

                const targetEntity = id ? (type === 'member' ? await client.users.fetch(id as string).catch(() => null) : await guild.roles.fetch(id as string).catch(() => null)) : null;

                if (channel) {
                    embed.addFields({
                        name: "__**Channel**__",
                        value: `<#${channel.id}>`,
                        inline: true,
                    });
                }
                if (id && type !== null) {
                    let targetValue = '';
                    if (type === 'member') {
                        targetValue = targetEntity ? `<@${targetEntity.id}>` : `Member ID: ${id}`;
                    } else { // type is 'role'
                        targetValue = targetEntity ? (targetEntity.id === guild.id ? '@everyone' : `<@&${targetEntity.id}>`) : `Role ID: ${id}`;
                    }
                    embed.addFields({
                        name: "__**Target**__",
                        value: targetValue,
                        inline: true,
                    });
                }

                if (allow !== null && allow !== undefined) {
                    const allowedPermissions = new PermissionsBitField(BigInt(allow)).toArray();
                    if (allowedPermissions.length > 0) {
                        embed.addFields({
                            name: "__**Allowed Permissions**__",
                            value: allowedPermissions.map(p => permissionMap[p] || p).join(', '),
                            inline: true,
                        });
                    }
                }
                if (deny !== null && deny !== undefined) {
                    const deniedPermissions = new PermissionsBitField(BigInt(deny)).toArray();
                    if (deniedPermissions.length > 0) {
                        embed.addFields({
                            name: "__**Denied Permissions**__",
                            value: deniedPermissions.map(p => permissionMap[p] || p).join(', '),
                            inline: true,
                        });
                    }
                }
            }
        }

        // Handle role fields
        if (action === AuditLogEvent.RoleCreate || action === AuditLogEvent.RoleUpdate || action === AuditLogEvent.RoleDelete) {
            const nameChange = changes?.find(change => change.key === 'name');
            const name = nameChange ? (nameChange.new as any || nameChange.old as any) : null;

            const colorChange = changes?.find(change => change.key === 'color');
            const color = colorChange ? (colorChange.new as any || colorChange.old as any) : null;

            const hoistChange = changes?.find(change => change.key === 'hoist');
            const hoist = hoistChange ? (hoistChange.new as any || hoistChange.old as any) : null;

            const mentionableChange = changes?.find(change => change.key === 'mentionable');
            const mentionable = mentionableChange ? (mentionableChange.new as any || mentionableChange.old as any) : null;

            const permissionsChange = changes?.find(change => change.key === 'permissions');
            const permissions = permissionsChange ? (permissionsChange.new as any || permissionsChange.old as any) : null;

            const role = targetId ? await guild.roles.fetch(targetId).catch(() => null) : null;

            if (action === AuditLogEvent.RoleCreate) {
                embed.addFields({
                    name: "__**Role Name**__",
                    value: `${name || role?.name || 'Unknown'}`,
                    inline: true,
                }, {
                    name: "__**Role ID**__",
                    value: `${targetId || 'Unknown'}`,
                    inline: true,
                });
                if (color) {
                    embed.addFields({
                        name: "__**Color**__",
                        value: `#${(color as number).toString(16).padStart(6, '0')}`,
                        inline: true,
                    });
                }
                if (hoist !== null) {
                    embed.addFields({
                        name: "__**Display Separately**__",
                        value: `${hoist ? 'Yes' : 'No'}`,
                        inline: true,
                    });
                }
                if (mentionable !== null) {
                    embed.addFields({
                        name: "__**Mentionable**__",
                        value: `${mentionable ? 'Yes' : 'No'}`,
                        inline: true,
                    });
                }
                if (permissions) {
                    const permissionNames = new PermissionsBitField(BigInt(permissions)).toArray().map(p => permissionMap[p] || p);
                    if (permissionNames.length > 0) {
                        embed.addFields({
                            name: "__**Permissions**__",
                            value: permissionNames.join(', '),
                            inline: true,
                        });
                    }
                }
            } else if (action === AuditLogEvent.RoleDelete) {
                embed.addFields({
                    name: "__**Role Name**__",
                    value: `${name || 'Unknown'}`,
                    inline: true,
                }, {
                    name: "__**Role ID**__",
                    value: `${targetId || 'Unknown'}`,
                    inline: true,
                });
            } else if (action === AuditLogEvent.RoleUpdate) {
                embed.addFields({
                    name: "__**Role**__",
                    value: `${role ? `<@&${role.id}>` : 'Unknown Role'}`,
                    inline: true,
                });
                for (const change of changes!) {
                    let oldValue: any = change.old;
                    let newValue: any = change.new;
                    if ((change.key as string) === 'colors') {
                        continue;
                    }
                    if (change.key === 'color') {
                        oldValue = oldValue ? `#${(oldValue as number).toString(16).padStart(6, '0')}` : 'None';
                        newValue = newValue ? `#${(newValue as number).toString(16).padStart(6, '0')}` : 'None';
                    } else if (change.key === 'permissions') {
                        const oldPerms = new PermissionsBitField(BigInt(oldValue || 0));
                        const newPerms = new PermissionsBitField(BigInt(newValue || 0));

                        const allPermissions = Object.keys(PermissionsBitField.Flags) as (keyof typeof PermissionsBitField.Flags)[];

                        const addedPerms: string[] = [];
                        const removedPerms: string[] = [];

                        for (const perm of allPermissions) {
                            const permValue = PermissionsBitField.Flags[perm];
                            if (newPerms.has(permValue) && !oldPerms.has(permValue)) {
                                addedPerms.push(perm);
                            }
                            if (oldPerms.has(permValue) && !newPerms.has(permValue)) {
                                removedPerms.push(perm);
                            }
                        }

                        if (addedPerms.length > 0) {
                            embed.addFields({
                                name: "__**Added Permissions**__",
                                value: addedPerms.map(p => permissionMap[p] || p).join(', '),
                                inline: true,
                            });
                        }
                        if (removedPerms.length > 0) {
                            embed.addFields({
                                name: "__**Removed Permissions**__",
                                value: removedPerms.map(p => permissionMap[p] || p).join(', '),
                                inline: true,
                            });
                        }
                    } else if (change.key === 'hoist' || change.key === 'mentionable') {
                        oldValue = oldValue ? 'Yes' : 'No';
                        newValue = newValue ? 'Yes' : 'No';
                    } else if (change.key === 'icon_hash') {
                        const roleId = role?.id;
                        oldValue = oldValue ? `https://cdn.discordapp.com/role-icons/${roleId}/${oldValue}.png` : 'None';
                        newValue = newValue ? `https://cdn.discordapp.com/role-icons/${roleId}/${newValue}.png` : 'None';
                    }

                    if ((change.key as string) !== 'permissions') {
                        embed.addFields({
                            name: `__**${change.key.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}**__`,
                            value: `Old: ${oldValue || 'None'}\nNew: ${newValue || 'None'}`,
                            inline: true,
                        });
                    }
                }
            }
        }

        return await sendMessage(actionChannel, { embeds: [embed] });
    },
};