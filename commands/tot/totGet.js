const { getCommandStatus } = require("../../functions.js")
const db = require('../../schemas/db.js');

module.exports = {
    name: "totget",
    aliases: ["gettot", "totchannel", "channeltot"],
    category: "tot",
    description: "Get response channel for This Or That Command",
    run: (client, message, args) => {
        getCommandStatus(message, "totget").then(function (res) {
            if (res === false) message.reply("Command disabled").then(m => m.delete(5000))
            if (res === true) {
                if (message.member.hasPermission("ADMINISTRATOR")) {
                    if (message.deletable) message.delete();

                    let guildID = message.guild.id;

                    db.findOne({ guildID: guildID, channels: { $elemMatch: { command: "tot" } } }, (err, exists) => {
                        if (err) console.log(err)
                        if (!exists) return message.reply("Channel has not been set.").then(m => m.delete(7500))
                        else {
                            return message.reply(`TOT's response channel is: <#${exists.channels[exists.channels.map(cmd => cmd.command).indexOf("tot")].channelID}>`).then(m => m.delete(7500))
                        }
                    }).catch(err => console.log(err))
                }
            }
        });
    }
}