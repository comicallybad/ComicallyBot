const { s, r, findID, del } = require("../../functions");
const db = require("../../schemas/db.js");
const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");

module.exports = {
    name: "setreactionrole",
    aliases: ["reactionrole", "rr", "setrr"],
    category: "reaction-roles",
    description: "Adds an emote users can react to to be given a role.",
    permissions: "moderator",
    usage: "<messageID> <emote | emoteID> <@role | roleID> [type] Types: 'addonly', 'add/remove'. Type will default to add/remove if not supplied.",
    run: async (client, message, args) => {
        if (!message.guild.me.permissions.has("MANAGE_ROLES"))
            return r(message.channel, message.author, "I don't have permission to manage roles!").then(m => del(m, 7500));

        if (!args[0])
            return r(message.channel, message.author, `Please provide a message ID. Use \`${prefix}help reactionrole\` for guidance.`).then(m => del(m, 7500));

        if (!args[1])
            return r(message.channel, message.author, "Please provide an emote or emote ID.").then(m => del(m, 7500));

        if (!args[2])
            return r(message.channel, message.author, "Please provide a role ID or at mention the role.").then(m => del(m, 7500));

        if (args[0] && args[1] && args[2]) {
            const msg = await message.channel.messages.fetch(args[0]).catch(err => err);

            if (!msg || msg.message == "Unknown Message" || !msg.id)
                return r(message.channel, message.author, "Could not find message in current channel.").then(m => del(m, 7500));

            let reaction = await args[1];

            const role = await message.guild.roles.cache.find(r => r.id === findID(message, args[2], "role"));
            if (!role) return r(message.channel, message.author, "Could not find role.").then(m => del(m, 7500));

            let type;
            if (args[3]) {
                if (args[3] == "addonly") {
                    type = "addonly"
                }
            } else type = "add/remove"

            if (reaction.includes("<:")) {
                let customEmoji = reaction.replace("<:", "").slice(reaction.replace("<:", "").indexOf(":") + 1, reaction.replace("<:", "").length - 1);
                msg.react(customEmoji).then(() => addReactionRole(msg, customEmoji, role, type)).catch(err => r(message.channel, message.author, `Invalid emoji: ${err}`));
            } else msg.react(reaction).then(() => addReactionRole(msg, reaction, role, type)).catch(err => r(message.channel, message.author, `Invalid emoji: ${err}`));
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
        .setTitle("Reaction Role Added")
        .setThumbnail(message.author.displayAvatarURL())
        .setFooter({ text: message.member.displayName, iconURL: message.author.displayAvatarURL() })
        .setTimestamp()

    db.findOne({
        guildID: guildID,
        reactionRoles: { $elemMatch: { messageID: messageID, roleID: roleID } }
    }, (err, exists) => {
        if (!exists) {
            db.updateOne({ guildID: guildID }, {
                $push: { reactionRoles: { messageID: messageID, reaction: reaction, roleID: roleID, roleName: roleName, type: type } }
            }).catch(err => console.log(err))
            embed.setDescription(stripIndents`
            **Reaction role create by:** ${message.member.user}
            **Reaction role:** ${role}(${role.id})
            **Reaction emoji/ID:** ${reaction}
            **Reaction role messasge ID:** ${messageID}
            **Reaction role type: **${type}`);

            return s(logChannel, '', embed);
        } else {
            const currentReaction = exists.reactionRoles.filter(rr => rr.messageID == messageID && rr.roleID == roleID)[0].reaction
            if (reaction !== currentReaction)
                message.reactions.cache.get(currentReaction).remove().catch(err => err); //remove old reaction if emote changes

            db.updateOne({ guildID: guildID, 'reactionRoles.messageID': messageID, 'reactionRoles.roleID': roleID }, {
                $set: { 'reactionRoles.$.roleName': roleName, 'reactionRoles.$.reaction': reaction, 'reactionRoles.$.type': type }
            }).catch(err => console.log(err));

            embed.setDescription(stripIndents`
            **Reaction role updated by:** ${message.member.user}
            **Reaction role:** ${role}(${role.id})
            **Reaction emoji/ID:** ${reaction}
            **Reaction role messasge ID:** ${messageID}
            **Reaction role type:** ${type}`);

            return s(logChannel, '', embed);
        }
    }).catch(err => console.log(err))
}