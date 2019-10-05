const { getCommandStatus, hasPermissions } = require("../../functions.js");
const { RichEmbed } = require("discord.js");
const db = require('../../schemas/db.js');

module.exports = {
    name: "getmod",
    aliases: ["mods", "listmods"],
    category: "administration",
    description: "Add permitted role for mod commands",
    permissions: "admin",
    usage: "<role name|@role>",
    run: (client, message, args) => {
        getCommandStatus(message, "getmod").then(function (res) {
            if (res === false) message.reply("Command disabled").then(m => m.delete(7500));
            if (res === true) {
                hasPermissions(message, "admin").then(async function (res) {
                    if (res === false) message.reply("You do not have permissions for this command.").then(m => m.delete(5000))
                    if (res === true) {

                        let guildID = message.guild.id;
                        let output = new RichEmbed()
                            .setColor("#0efefe")
                        if (message.deletable) message.delete();

                        db.findOne({
                            guildID: guildID,
                        }, (err, exists) => {
                            if (err) console.log(err)
                            if (!exists) return message.reply("Error within database").then(m => m.delete(7500))
                            else {
                                let modRoles = exists.modRoles.map(role => " Name: " + role.roleName + "  ID: " + role.roleID)
                                if (modRoles.length > 0) {
                                    output.addField("Mod Roles", modRoles)
                                    return message.channel.send(output).then(m => m.delete(7500))
                                } else return message.reply("You have no bot mods set.")
                            }
                        }).catch(err => console.log(err))
                    }
                })
            }
        })
    }
}