const { getCommandStatus, hasPermissions } = require("../../functions.js");
const db = require('../../schemas/db.js');

module.exports = {
    name: "addmod",
    aliases: ["amod", "modadd"],
    category: "administration",
    description: "Add permitted role/user for mod commands",
    permissions: "admin",
    usage: "<role name|@role|userID|@user>",
    run: (client, message, args) => {
        getCommandStatus(message, "addmod").then(function (res) {
            if (!res) message.reply("Command disabled").then(m => m.delete(7500));
            if (res) {
                hasPermissions(message, "admin").then(async function (res) {
                    if (!res) message.reply("You do not have permissions for this command.").then(m => m.delete(7500))
                    if (res) {

                        let guildID = message.guild.id;
                        if (message.deletable) message.delete();

                        if (!args[0])
                            return message.reply("Please provide a user/role.").then(m => m.delete(7500));

                        let roleNames = message.guild.roles.map(role => role.name.toLowerCase());
                        let roleIDs = message.guild.roles.map(role => role.id);
                        let userNames = message.guild.members.map(role => role.user.username.toLowerCase());
                        let userIDs = message.guild.members.map(role => role.user.id);

                        let channelMention = args[0].slice(3, args[0].length - 1);
                        let userMention = args[0].slice(2, args[0].length - 1);

                        if (!roleNames.includes(args[0].toLowerCase()) && !roleIDs.includes(channelMention) && !roleIDs.includes(args[0])
                            && !userIDs.includes(userMention) && !userIDs.includes(args[0]))
                            return message.reply("user/role not found").then(m => m.delete(7500));

                        if (roleNames.includes(args[0].toLowerCase()))
                            addMod(args[0], roleIDs[roleNames.indexOf(args[0])]);

                        if (roleIDs.includes(channelMention))
                            addMod(roleNames[roleIDs.indexOf(channelMention)], channelMention);

                        if (roleIDs.includes(args[0]))
                            addMod(roleNames[roleIDs.indexOf(args[0])], args[0])

                        if (userIDs.includes(args[0]))
                            addMod(userNames[userIDs.indexOf(args[0])], args[0])

                        if (userIDs.includes(userMention))
                            addMod(userNames[userIDs.indexOf(userMention)], userMention)

                        function addMod(roleName, roleID) {
                            db.findOne({
                                guildID: guildID, modRoles: { $elemMatch: { roleName: roleName, roleID: roleID } }
                            }, (err, exists) => {
                                if (err) console.log(err)
                                if (!exists) {
                                    db.updateOne({ guildID: guildID }, {
                                        $push: { modRoles: { roleName: roleName, roleID: roleID } }
                                    }).then(function () {
                                        return message.reply("Adding mod... this may take a second...").then(m => m.delete(7500));
                                    }).catch(err => console.log(err))
                                } else return message.reply("user/role already added.").then(m => m.delete(7500));
                            }).catch(err => console.log(err))
                        }
                    }
                })
            }
        })
    }
}