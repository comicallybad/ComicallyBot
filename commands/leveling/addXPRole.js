const { del, findID } = require("../../functions.js");
const db = require("../../schemas/db.js");
const { stripIndents } = require("common-tags");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "addxprole",
    aliases: ["xproleadd", "addrank"],
    category: "leveling",
    description: "Adds a role that can be assigned with XP levels.",
    permissions: "moderator",
    usage: "<@role|roleID> <level>",
    run: (client, message, args) => {
        if (!message.guild.me.hasPermission("MANAGE_ROLES"))
            return message.reply("I don't have permission to manage roles!").then(m => del(m, 7500));

        const logChannel = message.guild.channels.cache.find(c => c.name === "mod-logs") || message.channel;
        let guildID = message.guild.id;

        if (!args[0])
            return message.reply("Please provide a role.").then(m => del(m, 7500));

        if (!args[1])
            return message.reply("Please provide a XP level.").then(m => del(m, 7500));

        let roleNames = message.guild.roles.cache.map(role => role.name.toLowerCase());
        let roleIDs = message.guild.roles.cache.map(role => role.id);

        let ID = findID(message, args[0], "role");

        if (!ID)
            return message.reply("Role not found").then(m => del(m, 7500));

        if (ID)
            if (isNaN(args[1]) || parseInt(args[1]) <= 0)
                return message.reply("Please provide a valid XP level.").then(m => del(m, 7500));
            else addRole(roleNames[roleIDs.indexOf(ID)], ID, parseInt(args[1]));


        function addRole(roleName, roleID, inputLevel) {
            let level = parseInt(inputLevel);

            db.findOne({
                guildID: guildID, xpRoles: { $elemMatch: { roleName: roleName, roleID: roleID } }
            }, (err, exists) => {
                if (err) console.log(err)
                if (exists) {
                    db.updateOne({ guildID: guildID, 'xpRoles.roleID': roleID }, {
                        $set: { 'xpRoles.$.level': level }
                    }).catch(err => console.log(err))
                    return message.reply("Updating XP role level.").then(m => del(m, 7500));
                } if (!exists) {
                    db.updateOne({ guildID: guildID }, {
                        $push: { xpRoles: { roleName: roleName, roleID: roleID, level: level } }
                    }).then(function () {
                        const embed = new MessageEmbed()
                            .setColor("#0efefe")
                            .setTitle("XP Role Added")
                            .setThumbnail(message.author.displayAvatarURL())
                            .setFooter(message.member.displayName, message.author.displayAvatarURL())
                            .setTimestamp()
                            .setDescription(stripIndents`
                            **XP Role Added by:** ${message.member.user}
                            **XP Role Added:** ${roleName} (${roleID})
                            **Level:** ${level}`);

                        logChannel.send(embed);

                        return message.reply("Adding XP level role.").then(m => del(m, 7500));
                    }).catch(err => console.log(err))
                }
            }).catch(err => console.log(err))
        }
    }
}