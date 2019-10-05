const { getCommandStatus, hasPermissions } = require("../../functions.js")
const db = require('../../schemas/db.js');

module.exports = {
    name: "removememberrole",
    aliases: ["rmemberr", "removerolemember"],
    category: "moderation",
    description: "Remove permitted role for member commands",
    usage: "<role name|@role>",
    run: (client, message, args) => {
        getCommandStatus(message, "removememberrole").then(function (res) {
            if (res === false) message.reply("Command disabled").then(m => m.delete(7500));
            if (res === true) {

                let guildID = message.guild.id;
                if (message.deletable) message.delete();

                if (!message.member.hasPermission("ADMINISTRATOR"))
                    return message.reply("Only administrators have ability to use this command.").then(m => m.delete(7500));

                if (!args[0])
                    return message.reply("Please provide a role.").then(m => m.delete(7500));

                let roleNames = message.guild.roles.map(role => role.name.toLowerCase());
                let roleIDs = message.guild.roles.map(role => role.id);
                let atMention = args[0].slice(3, args[0].length - 1);

                if (!roleNames.includes(args[0].toLowerCase()) && !roleIDs.includes(atMention))
                    return message.reply("Role not found").then(m => m.delete(7500));

                if (roleNames.includes(args[0].toLowerCase()))
                    removeMemberRole(args[0], roleIDs[roleNames.indexOf(args[0])]);

                if (roleIDs.includes(atMention))
                    removeMemberRole(roleNames[roleIDs.indexOf(atMention)], atMention);

                function removeMemberRole(roleName, roleID) {
                    db.findOne({
                        guildID: guildID,
                        memberRoles: { $elemMatch: { roleName: roleName, roleID: roleID } }
                    }, (err, exists) => {
                        if (err) console.log(err)
                        if (exists) {
                            db.updateOne({ guildID: guildID }, {
                                $pull: { memberRoles: { roleName: roleName, roleID: roleID } }
                            }).then(function () {
                                return message.reply("Removing member role... this may take a second...").then(m => m.delete(7500));
                            }).catch(err => console.log(err))
                        } else return message.reply("Role was never added, or it was already removed.").then(m => m.delete(7500));
                    }).catch(err => console.log(err))
                }
            }
        })
    }
}