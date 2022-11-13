const db = require("../../schemas/db.js");
const { s, del } = require('../../functions.js');
const { MessageEmbed } = require("discord.js");

module.exports = async (client, message, user) => {
    if (!client.guilds.cache.get(message.message.guildId).me.permissions.has("MANAGE_ROLES"))
        return;

    if (user.id !== client.user.id) {
        if (message.partial)
            message.fetch().then(fullMessage => {
                checkReactionRole(fullMessage, user);
            }).catch(err => err); //Error handling for not being able to fetch message
        else checkReactionRole(message, user);
    } else removeReactionRole(message);
}

function removeReactionRole(message) {
    const msg = message.message;
    let guildID = msg.guild.id;
    let messageID = msg.id;
    let reaction;

    if (!message._emoji.id) reaction = message._emoji.name;
    else reaction = message._emoji.id;

    db.updateOne({ guildID: guildID }, {
        $pull: { reactionRoles: { messageID: messageID, reaction: reaction } }
    }).catch(err => err);
}

function checkReactionRole(message, user) {
    const msg = message.message;
    let logChannel;
    if (msg.guild.channels)
        logChannel = msg.guild.channels.cache.find(c => c.name.includes("reaction-logs"));
    if (!logChannel) msg.guild.channels.cache.find(c => c.name.includes("mod-logs")) || undefined;
    let guildUser = msg.guild.members.cache.get(user.id);
    let guildID = msg.guild.id;

    let messageID = msg.id;
    let reaction;

    if (!guildUser) return;

    if (!message._emoji.id) reaction = message._emoji.name;
    else reaction = message._emoji.id;

    const embed = new MessageEmbed()
        .setColor("#FF0000")
        .setTitle("Member left role via Reaction Role")
        .setFooter({ text: `${user.tag}`, iconURL: user.displayAvatarURL() })
        .setThumbnail(guildUser.user.displayAvatarURL())
        .setTimestamp()

    db.findOne({
        guildID: guildID,
        reactionRoles: { $elemMatch: { messageID: messageID, reaction: reaction, type: "add/remove" } }
    }, (err, exists) => {
        if (!exists) return;
        const roles = exists.reactionRoles.filter(rr => rr.messageID == messageID && rr.reaction == reaction && rr.type == "add/remove");
        roles.forEach(role => {
            if (!guildUser.roles.cache.get(role.roleID)) return;
            guildUser.roles.remove(role.roleID).then(() => {
                embed.setDescription(`**Member:** ${user} ${user.id}\n**Role: ${role.roleName}** (${role.roleID})`);
                if (logChannel) s(logChannel, '', embed);
            }).catch(err => {
                if (!msg.channel.permissionsFor(msg.guild.me).has("SEND_MESSAGES")) return;
                else return s(msg.channel, `${user} there was an issue removing you from the **${role.roleName}** ${err}`).then(m => del(m, 7500));
            });
        });
    }).catch(err => err);
}
