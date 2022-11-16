const db = require("../../schemas/db.js");
const { s, del } = require('../../functions.js');
const { MessageEmbed } = require("discord.js");

module.exports = async (client, message, user) => {
    if (!client.guilds.cache.get(message.message.guildId).me.permissions.has("MANAGE_ROLES"))
        return;

    if (user.id !== client.user.id) {
        if (message.partial) {
            message.fetch().then(fullMessage => {
                checkReactionRole(fullMessage, user);
            }).catch(err => err); //Error handling for not being able to fetch message
        } else {
            checkReactionRole(message, user);
        }
    }
}

async function checkReactionRole(message, user) {
    const msg = message.message;
    let logChannel;
    if (msg.guild.channels)
        logChannel = msg.guild.channels.cache.find(c => c.name.includes("role-logs"));
    if (!logChannel) msg.guild.channels.cache.find(c => c.name.includes("mod-logs")) || undefined;
    const guildUser = msg.guild.members.cache.get(user.id);
    const guildID = msg.guild.id;
    const messageID = msg.id;
    let reaction;

    if (!message._emoji.id) reaction = message._emoji.name;
    else reaction = message._emoji.id;

    let exists = await db.findOne({ guildID: guildID });
    if (exists && exists.deleteReaction && exists.deleteReaction == reaction) {
        const modRolesIDs = exists.modRoles.map(role => role.roleID);
        const roleIDs = guildUser.roles.cache.map(roles => roles.id);

        if (!modRolesIDs.includes(user.id) && !modRolesIDs.find(id => roleIDs.includes(id)) && guildUser.id !== process.env.USERID) return;

        let author = await msg.guild.members.fetch(msg.author.id).catch(err => err);
        if (!author) return;

        const textLogChannel = msg.guild.channels.cache.find(c => c.name.includes("text-logs"))
            || msg.guild.channels.cache.find(c => c.name.includes("mods-logs")) || undefined;

        const embed = new MessageEmbed()
            .setColor("#FF0000")
            .setAuthor({ name: `${guildUser.user.tag} deleted the following message:`, iconURL: user.displayAvatarURL() })
            .setThumbnail(author.user.displayAvatarURL())
            .setFooter({ text: `Deleted message was sent on` })
            .setTimestamp(msg.createdAt)
            .addFields({
                name: "__**Author**__",
                value: `${author}\n${author.user.tag}\n${author.id}`,
                inline: true,
            }, {
                name: `__**Channel**__`,
                value: `${msg.channel}`,
                inline: true
            }).setDescription(`${msg.content.length <= 1020 ? msg.content : msg.content.substring(0, 1020) + "`...`"}`);

        if (textLogChannel)
            s(textLogChannel, '', embed);
        return del(msg, 0);
    }

    const embed = new MessageEmbed()
        .setColor("#00FF00")
        .setTitle("Member joined role via Reaction Role")
        .setFooter({ text: `${user.tag}`, iconURL: user.displayAvatarURL() })
        .setThumbnail(guildUser.user.displayAvatarURL())
        .setTimestamp()

    db.findOne({
        guildID: guildID,
        reactionRoles: { $elemMatch: { messageID: messageID, reaction: reaction } }
    }, (err, exists) => {
        if (!exists) return;
        const roles = exists.reactionRoles.filter(rr => rr.messageID == messageID && rr.reaction == reaction);
        roles.forEach(role => {
            if (guildUser.roles.cache.get(role.roleID)) return;
            guildUser.roles.add(role.roleID).then(() => {
                embed.setDescription(`**Member:** ${user} ${user.id}\n**Role: ${role.roleName}** (${role.roleID})`);
                if (logChannel) s(logChannel, '', embed);
            }).catch(err => {
                if (!msg.channel.permissionsFor(msg.guild.me).has("SEND_MESSAGES")) return;
                else return s(msg.channel, `${user} there was an issue assigning you the **${role.roleName}** ${err}`).then(m => del(m, 7500));
            });
        });
    });
}
