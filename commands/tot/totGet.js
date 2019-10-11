const db = require('../../schemas/db.js');
const { hasPermissions, getCommandStatus } = require("../../functions.js")

module.exports = {
    name: "totget",
    aliases: ["gettot", "totchannel", "channeltot"],
    category: "tot",
    description: "Get response channel for This Or That Command",
    permissions: "moderator",
    run: (client, message, args) => {
        getCommandStatus(message, "totget").then(function (res) {
            if (!res) message.reply("Command disabled").then(m => m.delete(7500))
            if (res) {
                hasPermissions(message, "moderator").then(async function (res) {
                    if (!res) message.reply("You do not have permissions for this command.").then(m => m.delete(7500))
                    if (res) {

                        if (message.deletable) message.delete();

                        let guildID = message.guild.id;

                        db.findOne({ guildID: guildID, channels: { $elemMatch: { command: "tot" } } }, (err, exists) => {
                            if (err) console.log(err)
                            if (!exists) return message.reply("Channel has not been set.").then(m => m.delete(7500))
                            else return message.reply(`TOT's response channel is: <#${exists.channels[exists.channels.map(cmd => cmd.command).indexOf("tot")].channelID}>`).then(m => m.delete(7500))
                        }).catch(err => console.log(err))
                    }
                })
            }
        });
    }
}