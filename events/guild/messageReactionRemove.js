const db = require("../../schemas/db.js");
const { del } = require('../../functions.js');
const { MessageEmbed } = require("discord.js");

module.exports = async (client, message, user) => {
    if (user.id !== client.user.id) {
        if (message.partial) {
            message.fetch()
                .then(fullMessage => {
                    checkReactionRole(fullMessage, user);
                });
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
        logChannel = message.message.guild.channels.cache.find(c => c.name === "mod-logs" || undefined);
    let guildUser = message.message.guild.members.cache.get(user.id);
    let guildID = message.message.guild.id;

    let messageID = message.message.id;
    let reaction;

    if (!message._emoji.id) reaction = message._emoji.name;
    else reaction = message._emoji.id;

    const embed = new MessageEmbed()
        .setColor("#0efefe")
        .setFooter(user.id, user.displayAvatarURL())
        .setTimestamp()

    db.findOne({
        guildID: guildID,
        reactionRoles: { $elemMatch: { messageID: messageID, reaction: reaction, type: "add/remove" } }
    }, (err, exists) => {
        if (exists) {
            const roles = exists.reactionRoles.filter(rr => rr.messageID == messageID && rr.reaction == reaction && rr.type == "add/remove");
            roles.forEach(role => {
                guildUser.roles.remove(role.roleID).then(() => {
                    embed.setDescription(`**${user}**left the **${role.roleName}**(${role.roleID}) via Reaction Role`)
                    if (logChannel) logChannel.send(embed)
                    guildUser.send(`Hello, you have been removed from the **${role.roleName}** role in **${guildUser.guild.name}**`).catch(err => {
                        message.message.channel.send(`${user} was removed from the **${role.roleName}** role`).then(m => del(m, 7500))
                    });
                }).catch(err => {
                    if (err) guildUser.send(`Hello, there was an issue removing you from the **${role.roleName}** in **${guildUser.guild.name}**, possibly due to role hierarchy: \`${err}\``).catch(e => {
                        message.message.channel.send(`${user}there was an issue removing you fromthe **${role.roleName}**`).then(m => del(m, 7500));
                    });
                });
            });
        }
    });
}