const { r, del } = require("../../../utils/functions/functions.js");
const db = require("../../../utils/schemas/db.js");

module.exports = {
    name: "removerankchannel",
    aliases: ["removerankch", "rmrankch"],
    category: "leveling",
    description: "Remove response channel for leveling.",
    permissions: "moderator",
    usage: "<#channel | channelID>",
    run: async (client, message, args) => {
        return db.findOne({ guildID: message.guild.id, channels: { $elemMatch: { command: "rank" } } }, (err, exists) => {
            if (!exists) return r(message.channel, message.author, "There has been no rank channel set.").then(m => del(m, 7500));
            db.updateOne({ guildID: message.guild.id, 'channels.command': "rank" }, {
                $pull: { channels: { command: "rank" } }
            }).catch(err => err);
            return r(message.channel, message.author, "Removed rank channel.").then(m => del(m, 7500));
        }).catch(err => err);
    }
}