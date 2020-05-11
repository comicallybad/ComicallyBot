const { del } = require("../../functions.js");

module.exports = {
    name: "botinvite",
    aliases: ["invitebot", "botlink", "botinvitelink"],
    category: "support",
    description: "Provides a link to share the bot with others.",
    permissions: "member",
    run: (client, message, args) => {
        const botInvite = "https://top.gg/bot/492495421822730250";
        return message.reply(`The donation link to support the bot creator is: ${botInvite}`).then(m => del(m, 15000));
    }
}