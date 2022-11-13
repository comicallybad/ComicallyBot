const { s, r, findID, del } = require("../../functions");
const db = require("../../schemas/db.js");
const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");

module.exports = {
    name: "addreactionrole",
    aliases: ["reactionroleadd", "reactionrole", "rr"],
    category: "reaction-roles",
    description: "Adds an emoji users can react to to be given a role.",
    permissions: "moderator",
    usage: "<messageID> <emoji | emojiID> <@role | roleID> [type] Types: 'addonly', 'add/remove'. Type will default to add/remove if not supplied.",
    run: async (client, message, args) => {
        if (!message.guild.me.permissions.has("MANAGE_ROLES"))
            return r(message.channel, message.author, "I don't have permission to manage roles!").then(m => del(m, 7500));

        if (!message.channel.permissionsFor(message.guild.me).has("ADD_REACTIONS"))
            return r(message.channel, message.author, "I am missing permissions to `ADD_REACTIONS` in this channel for this command.").then(m => del(m, 30000));

        if (!args[0])
            return r(message.channel, message.author, `Please provide a message ID. Use \`${prefix}help reactionrole\` for guidance.`).then(m => del(m, 7500));

        if (!args[1])
            return r(message.channel, message.author, "Please provide an emoji or emoji ID.").then(m => del(m, 7500));

        if (!args[2])
            return r(message.channel, message.author, "Please provide a role ID or at mention the role.").then(m => del(m, 7500));

        if (args[0] && args[1] && args[2]) {
            const msg = await message.channel.messages.fetch(args[0]).catch(err => err);

            if (!msg || msg.message == "Unknown Message" || !msg.id)
                return r(message.channel, message.author, "Could not find message in current channel.").then(m => del(m, 7500));

            const reaction = args[1].includes("<:")
                ? args[1].replace("<:", "").slice(args[1].replace("<:", "").indexOf(":") + 1, args[1].replace("<:", "").length - 1)
                : args[1].includes("<a:")
                    ? args[1].replace("<a:", "").slice(args[1].replace("<a:", "").indexOf(":") + 1, args[1].replace("<a:", "").length - 1)
                    : args[1];

            let roleID = await findID(message, args[2]);
            const role = message.guild.roles.cache.find(r => r.id == roleID);
            if (!role) return r(message.channel, message.author, "Could not find role.").then(m => del(m, 7500));

            let type;
            if (args[3]) {
                if (args[3] == "addonly") type = "addonly"
            } else type = "add/remove"
            return msg.react(reaction).then(() => addReactionRole(msg, reaction, role, type)).catch(err => r(message.channel, message.author, `Invalid emoji: ${err}`));
        }
    }
}

function addReactionRole(message, reaction, role, type) {
    const logChannel = message.guild.channels.cache.find(c => c.name.includes("mod-logs")) || message.channel;
    const guildID = message.guild.id;
    const messageID = message.id;
    const roleID = role.id;
    const roleName = role.name;

    const embed = new MessageEmbed()
        .setColor("#0efefe")
        .setThumbnail(message.author.displayAvatarURL())
        .setFooter({ text: message.member.displayName, iconURL: message.author.displayAvatarURL() })
        .setTimestamp()

    return db.findOne({
        guildID: guildID,
        reactionRoles: { $elemMatch: { messageID: messageID, roleID: roleID } }
    }, async (err, exists) => {
        if (!exists) {
            db.updateOne({ guildID: guildID }, {
                $push: { reactionRoles: { messageID: messageID, reaction: reaction, roleID: roleID, roleName: roleName, type: type } }
            }).catch(err => r(message.channel, message.author, `There was an error adding this reaction role: ${err}`).then(m => del(m, 7500)));
            embed.setTitle("Reaction Role Added").setDescription(stripIndents`
            **Reaction Role Created By:** ${message.member.user}
            **Reaction Role:** ${role} (${role.id})
            **Reaction Emoji/ID:** ${reaction.length == 1 ? reaction : message.guild.emojis.cache.get(reaction)}
            **Reaction Role Messasge ID:** ${messageID}
            **Reaction Role Type: **${type}`);

            s(message.channel, "Reaction Role created.").then(m => del(m, 7500));
            return s(logChannel, '', embed);
        } else {
            db.updateOne({ guildID: guildID, 'reactionRoles.messageID': messageID, 'reactionRoles.roleID': roleID }, {
                $set: { 'reactionRoles.$.roleName': roleName, 'reactionRoles.$.reaction': reaction, 'reactionRoles.$.type': type }
            }).catch(err => r(message.channel, message.author, `There was an error updating this reaction role: ${err}`).then(m => del(m, 7500)));

            embed.setTitle("Reaction Role Updated").setDescription(stripIndents`
            **Reaction Role Updated By:** ${message.member.user}
            **Reaction Role:** ${role} (${role.id})
            **Reaction Emoji/ID:** <:${reaction.length == 1 ? reaction : message.guild.emojis.cache.get(reaction)}
            **Reaction Role Messasge ID:** ${messageID}
            **Reaction Role Type:** ${type}`);

            s(message.channel, "Reaction Role updated.").then(m => del(m, 7500));
            return s(logChannel, '', embed);
        }
    }).catch(err => err);
}