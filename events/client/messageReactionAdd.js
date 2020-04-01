const db = require("../../schemas/db.js");
const { userCooldown, userCooldownMessage } = require('../../functions.js');
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
    }
}

function checkReactionRole(message, user) {
    const logChannel = message.message.guild.channels.cache.find(c => c.name === "mod-logs" || undefined);
    let guildUser = message.message.guild.members.cache.get(user.id);
    let guildID = message.message.guild.id;

    if (!userCooldowns.find(usr => usr.userID == user.id && usr.guildID == guildID)) {
        userCooldown(guildID, user.id, user.username);

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
            reactionRoles: { $elemMatch: { messageID: messageID, reaction: reaction } }
        }, (err, exists) => {
            if (exists) {
                const roles = exists.reactionRoles.filter(rr => rr.messageID == messageID && rr.reaction == reaction);
                roles.forEach(role => {
                    guildUser.roles.add(role.roleID).then(() => {
                        embed.setDescription(`**${user}** joined the **${role.roleName}**(${role.roleID}) via Reaction Role`);
                        if (logChannel) logChannel.send(embed);
                        guildUser.send(`Hello, you have been added to the **${role.roleName}** role in **${guildUser.guild.name}**`).catch(err => console.log(err));
                    }).catch(err => {
                        if (err) guildUser.send(`Hello, there was an issue assigning you the **${role.roleName}** in **${guildUser.guild.name}**, possibly due to role heirarchy: \`${err}\``).catch(e => console.log(e));
                    });
                });
            }
        });
    } else {
        userCooldownMessage(guildID, guildUser, "reaction roles");
    }
}
