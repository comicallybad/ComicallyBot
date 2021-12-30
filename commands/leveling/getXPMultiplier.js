const { r, del } = require("../../functions.js");
const db = require('../../schemas/db.js');

module.exports = {
    name: "getxpmultiplier",
    aliases: ["xpmultiplier", "getmultiplier"],
    category: "leveling",
    description: "Get XP multiplier.",
    permissions: "member",
    run: (client, message, args) => {
        let guildID = message.guild.id;

        db.findOne({ guildID: guildID }, (err, exists) => {
            if (exists.xpMultiplier) return r(message.channel, message.author, "This server has a " + exists.xpMultiplier + "x multiplier").then(m => del(m, 15000));
            else {
                exists.xpMultiplier = 1;
                exists.save().catch(err => console.log(err))
                return r(message.channel, message.author, "This server has a 1x multiplier").then(m => del(m, 7500));
            }
        })
    }
}