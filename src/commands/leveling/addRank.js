const { s, r, del, findID } = require("../../../utils/functions/functions.js");
const db = require("../../../utils/schemas/db.js");
const xp = require("../../../utils/schemas/xp.js");
const { stripIndents } = require("common-tags");
const { EmbedBuilder } = require("discord.js");
const { checkXPRankup } = require("../../../utils/functions/dbFunctions.js");

module.exports = {
    name: "addrank",
    aliases: ["rankadd"],
    category: "leveling",
    description: "Adds a role that can be assigned with XP levels.",
    permissions: "moderator",
    usage: "<@role|roleID> <level>",
    run: async (client, message, args) => {
        if (!message.guild.me.permissions.has("MANAGE_ROLES"))
            return r(message.channel, message.author, "I don't have permission to `MANAGE_ROLES``!").then(m => del(m, 7500));

        if (!args[0])
            return r(message.channel, message.author, "Please provide a role.").then(m => del(m, 7500));

        if (!args[1])
            return r(message.channel, message.author, "Please provide a rank level.").then(m => del(m, 7500));

        const logChannel = message.guild.channels.cache.find(c => c.name.includes("mod-logs")) || message.channel;
        const guildID = message.guild.id;
        const roleNames = message.guild.roles.cache.map(role => role.name);
        const roleIDs = message.guild.roles.cache.map(role => role.id);

        let ID = await findID(message, args[0]);
        if (!ID) return r(message.channel, message.author, "Role not found").then(m => del(m, 7500));

        if (isNaN(args[1]) || parseInt(args[1]) <= 0)
            return r(message.channel, message.author, "Please provide a valid rank level.").then(m => del(m, 7500));
        else addRank(roleNames[roleIDs.indexOf(ID)], ID, parseInt(args[1]));

        function addRank(roleName, roleID, inputLevel) {
            let level = parseInt(inputLevel);
            let userIDs = message.guild.members.cache.map(user => user.user.id);

            return db.findOne({
                guildID: guildID, xpRoles: { $elemMatch: { roleID: roleID } }
            }, (err, exists) => {
                if (exists) {
                    db.updateOne({ guildID: guildID, 'xpRoles.roleID': roleID }, {
                        $set: { 'xpRoles.$.roleName': roleName, 'xpRoles.$.level': level }
                    }).then(() => {
                        const embed = new EmbedBuilder()
                            .setColor("#0efefe")
                            .setTitle("Rank Updated")
                            .setThumbnail(message.author.displayAvatarURL())
                            .setFooter({ text: message.member.displayName, iconURL: message.author.displayAvatarURL() })
                            .setTimestamp()
                            .setDescription(stripIndents`
                            **Rank Updated By:** ${message.member.user}
                            **Rank Updated:** ${roleName} (${roleID})
                            **Level:** ${level}`);

                        s(logChannel, '', embed);

                        userIDs.forEach(ID => {
                            xp.findOne({ guildID: guildID, userID: ID }, (err, exists) => {
                                if (exists && exists.level >= level) checkXPRankup(message, ID, level);
                            }).catch(err => err);
                        });
                        return s(message.channel, "Updated rank name and/or level.").then(m => del(m, 7500));
                    }).catch(err => err);
                } if (!exists) {
                    db.updateOne({ guildID: guildID }, {
                        $push: { xpRoles: { roleName: roleName, roleID: roleID, level: level } }
                    }).then(() => {
                        const embed = new EmbedBuilder()
                            .setColor("#0efefe")
                            .setTitle("Rank Added")
                            .setThumbnail(message.author.displayAvatarURL())
                            .setFooter({ text: message.member.displayName, iconURL: message.author.displayAvatarURL() })
                            .setTimestamp()
                            .setDescription(stripIndents`
                            **Rank Added By:** ${message.member.user}
                            **Rank Added:** ${roleName} (${roleID})
                            **Level:** ${level}`);

                        s(logChannel, '', embed);

                        userIDs.forEach(ID => {
                            xp.findOne({ guildID: guildID, userID: ID }, (err, exists) => {
                                if (exists && exists.level >= level) checkXPRankup(message, ID, level);
                            }).catch(err => err);
                        });
                        return s(message.channel, "Rank added.").then(m => del(m, 7500));
                    }).catch(err => err);
                }
            }).catch(err => err);
        }
    }
}