const db = require("../../schemas/db.js");
const { del } = require("../../functions.js")

module.exports = {
    name: "getbotchatchannel",
    aliases: ["getbotchannel", "gbc"],
    category: "autochat",
    description: "Adds the channel where the bot can talk to people.",
    permissions: "moderator",
    run: (client, message, args) => {
        db.findOne({ guildID: message.guild.id, channels: { $elemMatch: { command: "Bot Chatting" } } }, async (err, exists) => {
            if (exists) {
                let channel = await client.channels.cache.get(exists.channels.filter(x => x.command === "Bot Chatting")[0].channelID);
                return message.reply(`The bot chat channel is: ${channel}.`).then(m => del(m, 30000));
            } else return r(message.channel, message.author, "There has been no bot chat channel set.").then(m => del(m, 7500));
        });
    }
}