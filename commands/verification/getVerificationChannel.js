const { del } = require("../../functions.js");
const db = require('../../schemas/db.js');

module.exports = {
    name: "getverificationchannel",
    aliases: ["getverificationch", "getverifych", "gvc"],
    category: "verification",
    description: "Get the channel for verify command.",
    permissions: "moderator",
    usage: "<#channel | channelID>",
    run: (client, message, args) => {
        db.findOne({ guildID: message.guild.id, channels: { $elemMatch: { command: "verify" } } }, async (err, exists) => {
            if (exists) {
                let channel = await client.channels.cache.get(exists.channels.filter(x => x.command === "verify")[0].channelID);
                return message.reply(`The verification channel is: ${channel}.`).then(m => del(m, 30000));
            } else return message.reply("There has been no verification channel set.").then(m => del(m, 7500));
        });
    }
}