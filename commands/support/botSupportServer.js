const { del } = require("../../functions.js");

module.exports = {
    name: "botsupportserver",
    aliases: ["supportserver", "botserver", "botsupport"],
    category: "support",
    description: "Provides the support server for the bot.",
    permissions: "member",
    run: (client, message, args) => {
        const supportServer = "https://discord.gg/jK2JQVc";
        return message.reply(`The support server for the discord bot is: ${supportServer}`).then(m => del(m, 15000));
    }
}