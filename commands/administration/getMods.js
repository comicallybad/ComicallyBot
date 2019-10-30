const { RichEmbed } = require("discord.js");
const db = require('../../schemas/db.js');

module.exports = {
    name: "getmods",
    aliases: ["mods", "listmods", "moderators"],
    category: "administration",
    description: "Add permitted role for mod commands",
    permissions: "admin",
    usage: "<role name|@role>",
    run: (client, message, args) => {
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
                } else return message.reply("You have no bot mods set.").then(m => m.delete(7500))
            }
        }).catch(err => console.log(err))
    }
}