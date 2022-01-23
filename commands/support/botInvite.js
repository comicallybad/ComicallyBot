const { r, del } = require("../../functions.js");

module.exports = {
    name: "botinvite",
    aliases: ["botlink"],
    category: "support",
    description: "Provides a link to share the bot with others.",
    permissions: "member",
    run: (client, message, args) => {
        const botInvite = "https://top.gg/bot/492495421822730250";
        return r(message.channel, message.author, `The link to invite the bot is: ${botInvite}`).then(m => del(m, 15000));
    }
}