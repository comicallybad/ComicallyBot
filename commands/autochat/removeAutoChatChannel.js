const db = require("../../schemas/db.js");
const { r, del } = require("../../functions.js")

module.exports = {
    name: "removeautochatchannel",
    aliases: ["rmautochatch", "removeautochat", "rmautochat"],
    category: "autochat",
    description: "Removes the channel where the bot can talk to people.",
    permissions: "moderator",
    run: (client, message, args) => {
        return db.findOne({ guildID: message.guild.id, channels: { $elemMatch: { command: "Bot Chatting" } } }, (err, exists) => {
            if (!exists) return r(message.channel, message.author, "There has been no bot chat channel set.").then(m => del(m, 7500));
            db.updateOne({ guildID: message.guild.id, 'channels.command': "Bot Chatting" }, {
                $pull: { channels: { command: "Bot Chatting" } }
            }).catch(err => err);
            return r(message.channel, message.author, "Removed bot chatting channel.").then(m => del(m, 7500));
        }).catch(err => err);
    }
}