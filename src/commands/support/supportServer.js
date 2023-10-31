const { r, del } = require("../../../utils/functions/functions.js");

module.exports = {
    name: "supportserver",
    aliases: ["botsupport"],
    category: "support",
    description: "Provides the support server for the bot.",
    permissions: "member",
    run: (client, message, args) => {
        const supportServer = "Discord: https://discord.gg/mC4J2eETNv";
        return r(message.channel, message.author, `The support server for the discord bot is: ${supportServer}`).then(m => del(m, 15000));
    }
}