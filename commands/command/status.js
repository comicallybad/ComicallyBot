const db = require('../../schemas/db.js');
const { RichEmbed } = require("discord.js")

module.exports = {
    name: "status",
    aliases: ["commandstatus", "command"],
    category: "command",
    description: "Enable or disable commands",
    usage: prefix + "status",
    run: (client, message, args) => {
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
}