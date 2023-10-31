const { r, del } = require("../../../utils/functions/functions.js");
const db = require("../../../utils/schemas/db.js");

module.exports = {
    name: "getverificationchannel",
    aliases: ["getverificationch", "getverifych"],
    category: "verification",
    description: "Get the channel for verify command.",
    permissions: "moderator",
    usage: "<#channel | channelID>",
    run: (client, message, args) => {
        return db.findOne({ guildID: message.guild.id, channels: { $elemMatch: { command: "verify" } } }, async (err, exists) => {
            if (!exists) return r(message.channel, message.author, "There has been no verification channel set.").then(m => del(m, 7500));
            let channel = await client.channels.fetch(exists.channels.filter(x => x.command === "verify")[0].channelID);
            return r(message.channel, message.author, `The verification channel is: ${channel}.`).then(m => del(m, 30000));
        }).catch(err => err);
    }
}