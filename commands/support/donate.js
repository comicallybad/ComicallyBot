const { del } = require("../../functions.js");

module.exports = {
    name: "donate",
    aliases: ["botdonate", "donatebot"],
    category: "support",
    description: "Provides a link to support the creator of the bot ❤️.",
    permissions: "member",
    run: (client, message, args) => {
        const donationLink = "https://www.paypal.me/comicallybad";
        return message.reply(`The donation link to support the bot creator is: ${donationLink}`).then(m => del(m, 15000));
    }
}