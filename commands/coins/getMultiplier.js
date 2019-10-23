const { getCommandStatus, hasPermissions } = require("../../functions.js");
const db = require('../../schemas/db.js');

module.exports = {
    name: "getmultiplier",
    aliases: ["getcoinmultiplier", "getcoinsmultiplier", "coinsmultiplier"],
    category: "coins",
    description: "Get number of coins",
    permissions: "member",
    run: (client, message, args) => {
        getCommandStatus(message, "getmultiplier").then(function (res) {
            if (!res) message.reply("Command disabled").then(m => m.delete(7500));
            if (res) {
                hasPermissions(message, "member").then(async function (res) {
                    if (!res) message.reply("You do not have permissions for this command.").then(m => m.delete(7500))
                    if (res) {
                        let guildID = message.guild.id;

                        if (message.deletable) message.delete();
                        db.findOne({ guildID: guildID }, (err, exists) => {
                            if (!exists) console.log("Error in getMultiplier");
                            if (exists.coinsMultiplier) return message.reply("This server has a " + exists.coinsMultiplier + "x multiplier").then(m => m.delete(7500));
                            else {
                                exists.coinsMultiplier = 1;
                                exists.save().catch(err => console.log(err))
                                return message.reply("This server has a 1x multiplier").then(m => m.delete(7500));
                            }
                        })
                    }
                })
            }
        })
    }
}