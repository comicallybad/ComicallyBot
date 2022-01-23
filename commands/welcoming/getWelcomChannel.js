const db = require("../../schemas/db.js");
const { r, del } = require("../../functions.js")

module.exports = {
    name: "getwelcomechannel",
    aliases: ["getwelcomech", "gwelcomech"],
    category: "welcoming",
    description: "Adds a welcome channel where welcome message will be sent when a user joins.",
    permissions: "moderator",
    run: (client, message, args) => {
        db.findOne({ guildID: message.guild.id, channels: { $elemMatch: { command: "welcome" } } }, async (err, exists) => {
            if (exists) {
                let channel = await client.channels.cache.get(exists.channels.filter(x => x.command === "welcome")[0].channelID);
                return r(message.channel, message.author, `The welcome channel is: ${channel}.`).then(m => del(m, 30000));
            } else return r(message.channel, message.author, "There has been no welcome channel set.").then(m => del(m, 7500));
        });
    }
}