const db = require("../../schemas/db.js");
const { s, del } = require('../../functions.js');
const { MessageEmbed } = require("discord.js");

module.exports = async (client, message, user) => {
    if (user.id !== client.user.id) {
        if (message.partial) {
            message.fetch().then(fullMessage => {
                checkReactionRole(fullMessage, user);
            }).catch(err => err); //Error handling for not being able to fetch message
        } else {
            checkReactionRole(message, user);
        }
    } else {
        removeReactionRole(message);
    }
}

function removeReactionRole(message) {
    let guildID = message.message.guild.id;
    let messageID = message.message.id;
    let reaction;
    if (!message._emoji.id) {
        reaction = message._emoji.name;
    } else {
        reaction = message._emoji.id;
    }
    db.updateOne({ guildID: guildID }, {
        $pull: { reactionRoles: { messageID: messageID, reaction: reaction } }
    }).catch(err => console.log(err))
}

function checkReactionRole(message, user) {
    let logChannel;
    if (message.message.guild.channels)
        logChannel = message.message.guild.channels.cache.find(c => c.name.includes("reaction-logs"));
    if (!logChannel) message.message.guild.channels.cache.find(c => c.name.includes("mod-logs")) || undefined;
    let guildUser = message.message.guild.members.cache.get(user.id);
    let guildID = message.message.guild.id;

    let messageID = message.message.id;
    let reaction;

    if (!guildUser) return;

    if (!message._emoji.id) reaction = message._emoji.name;
    else reaction = message._emoji.id;

    const embed = new MessageEmbed()
        .setColor("#FF0000")
        .setTitle("Member left role via Reaction Role")
        .setFooter({ text: user.id, iconURL: user.displayAvatarURL() })
        .setThumbnail(guildUser.user.displayAvatarURL())
        .setTimestamp()

    db.findOne({
        guildID: guildID,
        reactionRoles: { $elemMatch: { messageID: messageID, reaction: reaction, type: "add/remove" } }
    }, (err, exists) => {
        if (exists) {
            const roles = exists.reactionRoles.filter(rr => rr.messageID == messageID && rr.reaction == reaction && rr.type == "add/remove");
            roles.forEach(role => {
                if (guildUser.roles.cache.get(role.roleID)) {
                    guildUser.roles.remove(role.roleID).then(() => {
                        embed.setDescription(`${user} ${user.tag} **${role.roleName}**(${role.roleID})`);
                        if (logChannel) s(logChannel, '', embed);
                    }).catch(err => {
                        if (err) {
                            if (!channelPermissions.has("SEND_MESSAGES")) return;
                            else return s(message.message.channel, `${user} there was an issue removing you from the **${role.roleName}**`).then(m => del(m, 7500));
                        }
                    });
                }
            });
        }
    }).clone().catch(err => err);
}
