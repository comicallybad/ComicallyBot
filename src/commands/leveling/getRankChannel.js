const { r, del } = require("../../../utils/functions/functions.js");
const db = require("../../../utils/schemas/db.js");

module.exports = {
    name: "getrankchannel",
    aliases: ["getrankch", "rankchannel", "rankch"],
    category: "leveling",
    description: "Get response channel for leveling.",
    permissions: "moderator",
    run: (client, message, args) => {
        let guildID = message.guild.id;

        return db.findOne({ guildID: guildID, channels: { $elemMatch: { command: "rank" } } }, (err, exists) => {
            if (!exists) return r(message.channel, message.author, "Channel has not been set.").then(m => del(m, 7500));
            return r(message.channel, message.author, `The Rank channel is: <#${exists.channels[exists.channels.map(cmd => cmd.command).indexOf("rank")].channelID}>`).then(m => del(m, 15000));
        }).catch(err => err)
    }
}