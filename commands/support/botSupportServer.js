const { del } = require("../../functions.js");

module.exports = {
    name: "botsupportserver",
    aliases: ["supportserver", "botserver", "botsupport"],
    category: "support",
    description: "Provides the support server for the bot.",
    permissions: "member",
    run: (client, message, args) => {
        const supportServer = "Discord: https://discord.gg/mC4J2eETNv";
        return message.reply(`The support server for the discord bot is: ${supportServer}`).then(m => del(m, 15000));
    }
}