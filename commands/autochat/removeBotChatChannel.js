const db = require("../../schemas/db.js");
const { del } = require("../../functions.js")

module.exports = {
    name: "removebotchatchannel",
    aliases: ["removebotchannel", "rbc"],
    category: "autochat",
    description: "Removes the channel where the bot can talk to people.",
    permissions: "moderator",
    run: (client, message, args) => {
        db.findOne({ guildID: message.guild.id, channels: { $elemMatch: { command: "Bot Chatting" } } }, (err, exists) => {
            if (exists) {
                db.updateOne({ guildID: message.guild.id, 'channels.command': "Bot Chatting" }, {
                    $pull: { channels: { command: "Bot Chatting" } }
                }).catch(err => console.log(err));
                return r(message.channel, message.author, "Removed bot chatting channel.").then(m => del(m, 7500));
            } else return r(message.channel, message.author, "There has been no bot chat channel set.").then(m => del(m, 7500));
        });
    }
}