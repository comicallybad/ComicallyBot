const { r, del } = require("../../../utils/functions/functions.js");
const db = require("../../../utils/schemas/db.js");

module.exports = {
    name: "getmultiplier",
    aliases: ["multiplier"],
    category: "leveling",
    description: "Get XP multiplier.",
    permissions: "member",
    run: (client, message, args) => {
        let guildID = message.guild.id;

        return db.findOne({ guildID: guildID }, (err, exists) => {
            if (exists.xpMultiplier) return r(message.channel, message.author, "This server has a " + exists.xpMultiplier + "x multiplier").then(m => del(m, 15000));
            exists.xpMultiplier = 1;
            exists.save().catch(err => err)
            return r(message.channel, message.author, "This server has a 1x multiplier").then(m => del(m, 7500));
        }).catch(err => err);
    }
}