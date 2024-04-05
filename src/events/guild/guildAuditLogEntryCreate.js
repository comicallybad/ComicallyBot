const { EmbedBuilder, AuditLogEvent } = require('discord.js');
const { s } = require('../../../utils/functions/functions.js');

module.exports = async (client, auditLog, guild) => {
    const { action, executorId, targetId, changes } = auditLog;
    let timeoutDuration;
    let timeoutEnd;

    const actionMap = {
        [AuditLogEvent.MemberUpdate]: {
            color: "",
            title: "",
            actionText: ""
        },
        [AuditLogEvent.MemberKick]: {
            color: "#FF0000",
            title: "Member Kicked",
            actionText: "Kicked"
        },
        [AuditLogEvent.MemberBanAdd]: {
            color: "#FF0000",
            title: "Member Banned",
            actionText: "Banned"
        },
        [AuditLogEvent.MemberBanRemove]: {
            color: "#00FF00",
            title: "Member Unbanned",
            actionText: "Unbanned"
        },
        [AuditLogEvent.InviteCreate]: {
            color: "#00FF00",
            title: "Invite Created",
            actionText: "Created"
        },
        [AuditLogEvent.InviteDelete]: {
            color: "#FF0000",
            title: "Invite Deleted",
            actionText: "Deleted"
        },
        [AuditLogEvent.InviteUpdate]: {
            color: "#0EFEFE",
            title: "Invite Updated",
            actionText: "Updated"
        }
    };

    //Handle member timeout mapping
    if (action === AuditLogEvent.MemberUpdate) {
        const timeoutChange = changes.find(change => change.key === 'communication_disabled_until');
        if (!timeoutChange) return;

        if (timeoutChange.new) {
            actionMap[action].color = "#FF0000";
            actionMap[action].title = "Member Timed Out";
            actionMap[action].actionText = "Timed Out";

            timeoutEnd = new Date(timeoutChange.new);
            const now = new Date();
            timeoutDuration = Math.round((timeoutEnd - now) / 60000);
        } else {
            actionMap[action].color = "#00FF00";
            actionMap[action].title = "Member Timeout Removed";
            actionMap[action].actionText = "Timeout Removed";
        }
    }

    if (!actionMap[action]) return;

    const actionChannel = guild.channels.cache.find(c => c.name.includes("action-logs"));
    if (!actionChannel) return;

    const reason = auditLog.reason || 'No reason provided.';
    const executor = await client.users.fetch(executorId).catch(err => { return null; });
    const target = await client.users.fetch(targetId).catch(err => { return null; })

    const embed = new EmbedBuilder()
        .setColor(actionMap[action].color)
        .setTitle(actionMap[action].title)
        .setThumbnail(target?.displayAvatarURL() || executor.displayAvatarURL())
        .setFooter({
            text: `${target ? target.tag : executor.tag} | ${target ? target.id : executor.id}`,
            iconURL: target ? target.displayAvatarURL() : executor.displayAvatarURL()
        })
        .setTimestamp()

    //Handle timeout, kick, ban, and unban
    if (target && executor) {
        //Ignore bot actions (logged during command execution)
        if (executor.id === client.user.id) return;
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
            inline: true,
        });
    }

    //Handle timeout fields
    if (timeoutDuration) {
        embed.addFields({
            name: "__**Removes**__",
            value: `<t:${Math.floor(timeoutEnd.getTime() / 1000)}:R>`,
            inline: true
        }, {
            name: "__**Lasts Until**__",
            value: `<t:${Math.floor(timeoutEnd.getTime() / 1000)}:f>`,
            inline: true
        });
    }

    //Handle invite fields
    if (action === AuditLogEvent.InviteCreate || action === AuditLogEvent.InviteUpdate || action === AuditLogEvent.InviteDelete) {
        const inviteChange = changes.find(change => change.key === 'code');
        if (!inviteChange) return;

        const inviteCode = inviteChange.new || inviteChange.old;
        const channelIdChange = changes.find(change => change.key === 'channel_id');
        const channelId = channelIdChange ? (channelIdChange.new || channelIdChange.old) : null;
        const inviterIdChange = changes.find(change => change.key === 'inviter_id');
        const inviterId = inviterIdChange ? (inviterIdChange.new || inviterIdChange.old) : null;
        const maxUsesChange = changes.find(change => change.key === 'max_uses');
        const maxUses = maxUsesChange ? (maxUsesChange.old || maxUsesChange.new) : null;
        const usesChange = changes.find(change => change.key === 'uses');
        const uses = usesChange ? (usesChange.old || usesChange.new) : null;
        const maxAgeChange = changes.find(change => change.key === 'max_age');
        const maxAge = maxAgeChange ? (maxAgeChange.new || maxAgeChange.old) : null;

        const channel = channelId ? await client.channels.fetch(channelId).catch(err => { return null; }) : null;
        const inviter = inviterId ? await client.users.fetch(inviterId).catch(err => { return null; }) : null;

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
            value: `${maxAge ? `<t:${Math.floor((Date.now() + maxAge * 1000) / 1000)}:R>` : "Never expires"}`,
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

    return s(actionChannel, '', embed);
};