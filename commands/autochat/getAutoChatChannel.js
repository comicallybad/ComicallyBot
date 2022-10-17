const db = require("../../schemas/db.js");
const { r, del } = require("../../functions.js")

module.exports = {
    name: "getautochatchannel",
    aliases: ["getautochatch"],
    category: "autochat",
    description: "Adds the channel where the bot can talk to people.",
    permissions: "moderator",
    run: (client, message, args) => {
        return db.findOne({ guildID: message.guild.id, channels: { $elemMatch: { command: "Bot Chatting" } } }, async (err, exists) => {
            if (!exists) return r(message.channel, message.author, "There has been no bot chat channel set.").then(m => del(m, 7500));
            let channel = await client.channels.cache.get(exists.channels.filter(x => x.command === "Bot Chatting")[0].channelID);
            return r(message.channel, message.author, `The bot chat channel is: ${channel}.`).then(m => del(m, 30000));
        }).catch(err => err);
    }
}