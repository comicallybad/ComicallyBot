const { del } = require("../../functions.js");

module.exports = {
    name: "github",
    aliases: ["botcode", "botgithub"],
    category: "support",
    description: "Sends a link to the open source Github for the bot.",
    permissions: "member",
    run: (client, message, args) => {
        return message.channel.send("Here is the link to the open source Github: https://github.com/comicallybad/comicallybot2.0").then(m => del(m, 30000));
    }
}