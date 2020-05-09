const { del } = require("../../functions.js");
const db = require('../../schemas/db.js');

module.exports = {
    name: "getmultiplier",
    aliases: ["xpmultiplier", "getxpmultiplier", "multiplierget"],
    category: "leveling",
    description: "Get XP multiplier.",
    permissions: "member",
    run: (client, message, args) => {
        let guildID = message.guild.id;

        db.findOne({ guildID: guildID }, (err, exists) => {
            if (!exists) console.log("Error in getMultiplier");
            if (exists.xpMultiplier) return message.reply("This server has a " + exists.xpMultiplier + "x multiplier").then(m => del(m, 7500));
            else {
                exists.xpMultiplier = 1;
                exists.save().catch(err => console.log(err))
                return message.reply("This server has a 1x multiplier").then(m => del(m, 7500));
            }
        })
    }
}