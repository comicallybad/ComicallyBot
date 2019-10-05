const db = require('../../schemas/db.js');
const { RichEmbed } = require("discord.js");
const { hasPermissions } = require("../../functions.js");

module.exports = {
    name: "status",
    aliases: ["commandstatus", "commands"],
    category: "command",
    description: "Enable or disable commands",
    permissions: "moderator",
    usage: prefix + "status",
    run: (client, message, args) => {
        hasPermissions(message, "moderator").then(async function (res) {
            if (res === false) message.reply("You do not have permissions for this command.").then(m => m.delete(5000))
            if (res === true) {
                let guildID = message.guild.id;
                let output = new RichEmbed()
                    .setColor("#0efefe")
                db.findOne({ guildID: guildID }, (err, exists) => {
                    if (err) console.log(err)
                    if (!exists) return message.reply("Error in database")
                    if (exists) {
                        const mapping = exists.commands.map((element, index) => {
                            if (element.name !== "toggle" && element.name !== "help" && element.name !== "status" && element.name !== "toggleall") {
                                if (element.status === true) return `${element.name}:✅`
                                if (element.status === false) return `${element.name}:❌`
                            }
                        }).filter(filter => filter)
                        output.addField("Command Status", mapping)
                        return message.channel.send(output).then(m => m.delete(10000))
                    }
                })
                if (message.deletable) message.delete();
            }
        })
    }
}