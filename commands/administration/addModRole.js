const { getCommandStatus, hasPermissions } = require("../../functions.js");
const db = require('../../schemas/db.js');

module.exports = {
    name: "addmodrole",
    aliases: ["amodr", "addrolemod"],
    category: "administration",
    description: "Add permitted role for mod commands",
    permissions: "admin",
    usage: "<role name|@role>",
    run: (client, message, args) => {
        getCommandStatus(message, "addmodrole").then(function (res) {
            if (res === false) message.reply("Command disabled").then(m => m.delete(7500));
            if (res === true) {
                hasPermissions(message, "admin").then(async function (res) {
                    if (res === false) message.reply("You do not have permissions for this command.").then(m => m.delete(5000))
                    if (res === true) {

                        let guildID = message.guild.id;
                        if (message.deletable) message.delete();

                        if (!args[0])
                            return message.reply("Please provide a role.").then(m => m.delete(7500));

                        let roleNames = message.guild.roles.map(role => role.name.toLowerCase());
                        let roleIDs = message.guild.roles.map(role => role.id);
                        let atMention = args[0].slice(3, args[0].length - 1);

                        if (!roleNames.includes(args[0].toLowerCase()) && !roleIDs.includes(atMention))
                            return message.reply("Role not found").then(m => m.delete(7500));

                        if (roleNames.includes(args[0].toLowerCase()))
                            addModRole(args[0], roleIDs[roleNames.indexOf(args[0])]);

                        if (roleIDs.includes(atMention))
                            addModRole(roleNames[roleIDs.indexOf(atMention)], atMention);

                        function addModRole(roleName, roleID) {
                            db.findOne({
                                guildID: guildID,
                                modRoles: { $elemMatch: { roleName: roleName, roleID: roleID } }
                            }, (err, exists) => {
                                if (err) console.log(err)
                                if (!exists) {
                                    db.updateOne({ guildID: guildID }, {
                                        $push: { modRoles: { roleName: roleName, roleID: roleID } }
                                    }).then(function () {
                                        return message.reply("Adding member role... this may take a second...").then(m => m.delete(7500));
                                    }).catch(err => console.log(err))
                                } else return message.reply("Role already added.").then(m => m.delete(7500));
                            }).catch(err => console.log(err))
                        }
                    }
                })
            }
        })
    }
}