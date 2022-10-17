const db = require("../../schemas/db.js");
const { r, del } = require("../../functions.js")

module.exports = {
    name: "removeverificationchannel",
    aliases: ["removeverificationch", "rmverifytchannel", "rmverifych"],
    category: "verification",
    description: "Removes the verifcation channel.",
    permissions: "moderator",
    run: (client, message, args) => {
        return db.findOne({ guildID: message.guild.id, channels: { $elemMatch: { command: "verify" } } }, (err, exists) => {
            if (!exists) return r(message.channel, message.author, "There has been no verifcation channel set.").then(m => del(m, 7500));
            db.updateOne({ guildID: message.guild.id, 'channels.command': "verify" }, {
                $pull: { channels: { command: "verify" } }
            }).catch(err => err);
            return r(message.channel, message.author, "Removed verification channel.").then(m => del(m, 7500));
        }).catch(err => err);
    }
}