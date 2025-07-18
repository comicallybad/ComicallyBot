import { AuditLogChange, AuditLogEvent, Client, EmbedBuilder, Guild, GuildAuditLogsEntry, PermissionsBitField, TextChannel, ChannelType } from "discord.js";

// Maps for formatting
const channelTypeMap: { [key: number]: string } = {
    [ChannelType.GuildText]: "Text",
    [ChannelType.GuildVoice]: "Voice",
    [ChannelType.GuildCategory]: "Category",
    [ChannelType.GuildAnnouncement]: "Announcement",
    [ChannelType.GuildStageVoice]: "Stage",
    [ChannelType.GuildDirectory]: "Directory",
    [ChannelType.GuildForum]: "Forum",
};

const permissionMap: { [key: string]: string } = {
    CreateInstantInvite: "Create Instant Invite",
    KickMembers: "Kick Members",
    BanMembers: "Ban Members",
    Administrator: "Administrator",
    ManageChannels: "Manage Channels",
    ManageGuild: "Manage Guild",
    ViewAuditLog: "View Audit Log",
    ViewGuildInsights: "View Guild Insights",
    ManageRoles: "Manage Roles",
    ManageWebhooks: "Manage Webhooks",
    ManageEmojisAndStickers: "Manage Emojis and Stickers",
    ManageGuildExpressions: "Manage Expressions",
    ManageEvents: "Manage Events",
    ManageThreads: "Manage Threads",
    ViewCreatorMonetizationAnalytics: "View Creator Monetization Analytics",
    UseExternalStatuses: "Use External Statuses",
    ChangeNickname: "Change Nickname",
    ManageNicknames: "Manage Nicknames",
    ModerateMembers: "Moderate Members",
    ViewChannel: "View Channel",
    SendMessages: "Send Messages",
    SendMessagesInThreads: "Send Messages in Threads",
    CreatePublicThreads: "Create Public Threads",
    CreatePrivateThreads: "Create Private Threads",
    EmbedLinks: "Embed Links",
    AttachFiles: "Attach Files",
    AddReactions: "Add Reactions",
    UseExternalEmojis: "Use External Emojis",
    UseExternalStickers: "Use External Stickers",
    MentionEveryone: "Mention Everyone",
    ManageMessages: "Manage Messages",
    ReadMessageHistory: "Read Message History",
    SendTTSMessages: "Send TTS Messages",
    UseApplicationCommands: "Use Application Commands",
    Connect: "Connect",
    Speak: "Speak",
    Stream: "Stream",
    UseEmbeddedActivities: "Use Embedded Activities",
    UseVoiceActivity: "Use Voice Activity",
    PrioritySpeaker: "Priority Speaker",
    MuteMembers: "Mute Members",
    DeafenMembers: "Deafen Members",
    MoveMembers: "Move Members",
    RequestToSpeak: "Request to Speak",
    UseSoundboard: "Use Soundboard",
    UseExternalSounds: "Use External Sounds",
    SendVoiceMessages: "Send Voice Messages",
};

/**
 * Extracts a specific change from the audit log changes array.
 * @param changes The array of audit log changes.
 * @param key The key of the change to find.
 * @returns An object with the old and new values.
 */
function getChange<T>(changes: readonly AuditLogChange[], key: string): { old?: T, new?: T } {
    const change = changes.find(c => c.key === key);
    return {
        old: change?.old as T | undefined,
        new: change?.new as T | undefined,
    };
}

/**
 * Formats a timestamp for display in an embed.
 * @param time The time in milliseconds.
 * @returns A formatted timestamp string.
 */
function formatTimestamp(time: number): string {
    return `<t:${Math.floor(time / 1000)}:R>`;
}

/**
 * Handles logging for member timeout updates.
 * @param embed The embed to add fields to.
 * @param changes The audit log changes.
 * @returns The modified embed and timeout details.
 */
export function handleMemberTimeout(embed: EmbedBuilder, changes: readonly AuditLogChange[]): { embed: EmbedBuilder, timeoutEnd?: Date } {
    const timeoutChange = getChange<string>(changes, "communication_disabled_until");
    if (!timeoutChange) return { embed };

    if (timeoutChange.new) {
        const timeoutEnd = new Date(timeoutChange.new);
        embed.addFields(
            { name: "__**Removes**__", value: formatTimestamp(timeoutEnd.getTime()), inline: true },
            { name: "__**Lasts Until**__", value: `<t:${Math.floor(timeoutEnd.getTime() / 1000)}:f>`, inline: true }
        );
        return { embed, timeoutEnd };
    }
    return { embed };
}

/**
 * Handles logging for invite creations, updates, and deletions.
 * @param embed The embed to add fields to.
 * @param changes The audit log changes.
 * @param client The Discord client instance.
 */
export async function handleInvite(embed: EmbedBuilder, changes: readonly AuditLogChange[], client: Client): Promise<EmbedBuilder> {
    const code = getChange<string>(changes, "code").new ?? getChange<string>(changes, "code").old;
    const channelId = getChange<string>(changes, "channel_id").new ?? getChange<string>(changes, "channel_id").old;
    const inviterId = getChange<string>(changes, "inviter_id").new ?? getChange<string>(changes, "inviter_id").old;
    const maxUses = getChange<number>(changes, "max_uses").new ?? getChange<number>(changes, "max_uses").old;
    const uses = getChange<number>(changes, "uses").new ?? getChange<number>(changes, "uses").old;
    const maxAge = getChange<number>(changes, "max_age").new ?? getChange<number>(changes, "max_age").old;

    const channel = channelId ? await client.channels.fetch(channelId).catch(() => null) : null;
    const inviter = inviterId ? await client.users.fetch(inviterId).catch(() => null) : null;

    embed.addFields(
        { name: "__**Invite**__", value: `[${code}](https://discord.gg/${code})`, inline: true },
        { name: "__**Channel**__", value: channel ? `<#${channel.id}>` : "Unknown Channel", inline: true },
        { name: "__**Inviter**__", value: inviter ? `<@${inviter.id}>` : "Unknown Inviter", inline: true },
        { name: "__**Expires**__", value: maxAge ? formatTimestamp(Date.now() + maxAge * 1000) : "Never expires", inline: true },
        { name: "__**Max Uses**__", value: maxUses ? `${maxUses}` : "Unlimited", inline: true },
        { name: "__**Uses**__", value: uses ? `${uses}` : "0", inline: true }
    );

    return embed;
}

/**
 * Handles logging for channel-related audit log events.
 * @param embed The embed to add fields to.
 * @param auditLog The full audit log entry.
 * @param guild The guild where the event occurred.
 * @param client The Discord client instance.
 */
export async function handleChannel(embed: EmbedBuilder, auditLog: GuildAuditLogsEntry, guild: Guild, client: Client): Promise<EmbedBuilder> {
    const { action, changes, targetId, extra } = auditLog;
    const channel = targetId ? await client.channels.fetch(targetId).catch(() => null) : null;

    switch (action) {
        case AuditLogEvent.ChannelCreate: {
            const name = getChange<string>(changes, "name").new;
            const topic = getChange<string>(changes, "topic").new;
            const nsfw = getChange<boolean>(changes, "nsfw").new;
            const bitrate = getChange<number>(changes, "bitrate").new;
            const userLimit = getChange<number>(changes, "user_limit").new;

            embed.addFields(
                { name: "__**Channel Name**__", value: `${name || (channel as TextChannel)?.name || "Unknown"}`, inline: true },
                { name: "__**Channel Type**__", value: `${channel ? channelTypeMap[channel.type] || "Unknown" : "Unknown"}`, inline: true }
            );
            if (topic) embed.addFields({ name: "__**Topic**__", value: topic, inline: true });
            if (nsfw !== undefined) embed.addFields({ name: "__**NSFW**__", value: nsfw ? "Yes" : "No", inline: true });
            if (bitrate) embed.addFields({ name: "__**Bitrate**__", value: `${bitrate / 1000} kbps`, inline: true });
            if (userLimit) embed.addFields({ name: "__**User Limit**__", value: `${userLimit}`, inline: true });
            break;
        }
        case AuditLogEvent.ChannelDelete: {
            const name = getChange<string>(changes, "name").old;
            const type = getChange<number>(changes, "type").old;
            embed.addFields(
                { name: "__**Channel Name**__", value: `${name || "Unknown"}`, inline: true },
                { name: "__**Channel Type**__", value: `${type !== undefined ? channelTypeMap[type] || "Unknown" : "Unknown"}`, inline: true }
            );
            break;
        }
        case AuditLogEvent.ChannelUpdate: {
            if (channel) embed.addFields({ name: "__**Channel**__", value: `<#${channel.id}>`, inline: true });
            for (const change of changes) {
                let { old: oldValue, new: newValue } = change;
                if (change.key === "type") {
                    oldValue = channelTypeMap[oldValue as number] || oldValue;
                    newValue = channelTypeMap[newValue as number] || newValue;
                } else if (change.key === "bitrate") {
                    oldValue = `${(oldValue as number) / 1000} kbps`;
                    newValue = `${(newValue as number) / 1000} kbps`;
                } else if (change.key === "nsfw") {
                    oldValue = oldValue ? "Yes" : "No";
                    newValue = newValue ? "Yes" : "No";
                }
                const keyName = change.key.replace(/_/g, " ").replace(/id/g, "ID").split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
                embed.addFields({ name: `__**${keyName}**__`, value: `Old: ${oldValue || "None"}\nNew: ${newValue || "None"}`, inline: true });
            }
            break;
        }
        case AuditLogEvent.ChannelOverwriteCreate:
        case AuditLogEvent.ChannelOverwriteUpdate:
        case AuditLogEvent.ChannelOverwriteDelete: {
            const id = (extra as { id: string })?.id ?? getChange<string>(changes, "id").new ?? getChange<string>(changes, "id").old;
            const type = (extra as { type: number })?.type === 1 ? "member" : "role";
            const allow = getChange<string>(changes, "allow").new ?? getChange<string>(changes, "allow").old;
            const deny = getChange<string>(changes, "deny").new ?? getChange<string>(changes, "deny").old;

            if (channel) embed.addFields({ name: "__**Channel**__", value: `<#${channel.id}>`, inline: true });

            if (id) {
                const targetEntity = type === "member"
                    ? await client.users.fetch(id).catch(() => null)
                    : await guild.roles.fetch(id).catch(() => null);
                let targetValue = "";
                if (type === "member") {
                    targetValue = targetEntity ? `<@${targetEntity.id}>` : `Member ID: ${id}`;
                } else {
                    targetValue = targetEntity ? (targetEntity.id === guild.id ? "@everyone" : `<@&${targetEntity.id}>`) : `Role ID: ${id}`;
                }
                embed.addFields({ name: "__**Target**__", value: targetValue, inline: true });
            }

            if (allow) {
                const allowedPermissions = new PermissionsBitField(BigInt(allow)).toArray();
                if (allowedPermissions.length > 0) {
                    embed.addFields({ name: "__**Allowed Permissions**__", value: allowedPermissions.map(p => permissionMap[p] || p).join(", "), inline: true });
                }
            }
            if (deny) {
                const deniedPermissions = new PermissionsBitField(BigInt(deny)).toArray();
                if (deniedPermissions.length > 0) {
                    embed.addFields({ name: "__**Denied Permissions**__", value: deniedPermissions.map(p => permissionMap[p] || p).join(", "), inline: true });
                }
            }
            break;
        }
    }
    return embed;
}

/**
 * Handles logging for role-related audit log events.
 * @param embed The embed to add fields to.
 * @param auditLog The full audit log entry.
 * @param guild The guild where the event occurred.
 */
export async function handleRole(embed: EmbedBuilder, auditLog: GuildAuditLogsEntry, guild: Guild): Promise<EmbedBuilder> {
    const { action, changes, targetId } = auditLog;
    const role = targetId ? await guild.roles.fetch(targetId).catch(() => null) : null;

    switch (action) {
        case AuditLogEvent.RoleCreate: {
            const name = getChange<string>(changes, "name").new;
            const color = getChange<number>(changes, "color").new;
            const hoist = getChange<boolean>(changes, "hoist").new;
            const mentionable = getChange<boolean>(changes, "mentionable").new;
            const permissions = getChange<string>(changes, "permissions").new;

            embed.addFields(
                { name: "__**Role Name**__", value: `${name || role?.name || "Unknown"}`, inline: true },
                { name: "__**Role ID**__", value: `${targetId || "Unknown"}`, inline: true }
            );
            if (color) embed.addFields({ name: "__**Color**__", value: `#${color.toString(16).padStart(6, "0")}`, inline: true });
            if (hoist !== undefined) embed.addFields({ name: "__**Display Separately**__", value: hoist ? "Yes" : "No", inline: true });
            if (mentionable !== undefined) embed.addFields({ name: "__**Mentionable**__", value: mentionable ? "Yes" : "No", inline: true });
            if (permissions) {
                const permissionNames = new PermissionsBitField(BigInt(permissions)).toArray().map(p => permissionMap[p] || p);
                if (permissionNames.length > 0) embed.addFields({ name: "__**Permissions**__", value: permissionNames.join(", "), inline: true });
            }
            break;
        }
        case AuditLogEvent.RoleDelete: {
            const name = getChange<string>(changes, "name").old;
            embed.addFields(
                { name: "__**Role Name**__", value: `${name || "Unknown"}`, inline: true },
                { name: "__**Role ID**__", value: `${targetId || "Unknown"}`, inline: true }
            );
            break;
        }
        case AuditLogEvent.RoleUpdate: {
            if (role) embed.addFields({ name: "__**Role**__", value: `<@&${role.id}>`, inline: true });
            for (const change of changes) {
                if (change.key === "permissions") {
                    const oldPerms = new PermissionsBitField(BigInt(change.old as string || "0"));
                    const newPerms = new PermissionsBitField(BigInt(change.new as string || "0"));
                    const addedPermissions = newPerms.toArray().filter(p => !oldPerms.has(p)).map(p => permissionMap[p] || p);
                    const removedPermissions = oldPerms.toArray().filter(p => !newPerms.has(p)).map(p => permissionMap[p] || p);

                    if (addedPermissions.length > 0) embed.addFields({ name: "__**Permissions Added**__", value: addedPermissions.join(", "), inline: true });
                    if (removedPermissions.length > 0) embed.addFields({ name: "__**Permissions Removed**__", value: removedPermissions.join(", "), inline: true });
                } else {
                    if (change.key as string === 'colors') continue;
                    let { old: oldValue, new: newValue } = change;
                    if (change.key === "color") {
                        oldValue = oldValue ? `#${(oldValue as number).toString(16).padStart(6, "0")}` : "None";
                        newValue = newValue ? `#${(newValue as number).toString(16).padStart(6, "0")}` : "None";
                    } else if (change.key === "hoist" || change.key === "mentionable") {
                        oldValue = oldValue ? "Yes" : "No";
                        newValue = newValue ? "Yes" : "No";
                    }
                    const keyName = change.key.replace(/_/g, " ").split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
                    embed.addFields({ name: `__**${keyName}**__`, value: `Old: ${oldValue || "None"}\nNew: ${newValue || "None"}`, inline: true });
                }
            }
            break;
        }
    }
    return embed;
}
