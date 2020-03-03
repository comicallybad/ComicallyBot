const db = require('../../schemas/db.js');

module.exports = {
    name: "getmultiplier",
    aliases: ["getcoinmultiplier", "getcoinsmultiplier", "coinsmultiplier"],
    category: "coins",
    description: "Get number of coins.",
    permissions: "member",
    run: (client, message, args) => {
        let guildID = message.guild.id;

        db.findOne({ guildID: guildID }, (err, exists) => {
            if (!exists) console.log("Error in getMultiplier");
            if (exists.coinsMultiplier) return message.reply("This server has a " + exists.coinsMultiplier + "x multiplier").then(m => m.delete({ timeout: 7500 }));
            else {
                exists.coinsMultiplier = 1;
                exists.save().catch(err => console.log(err))
                return message.reply("This server has a 1x multiplier").then(m => m.delete({ timeout: 7500 }));
            }
        })
    }
}