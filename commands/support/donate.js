const { r, del } = require("../../functions.js");

module.exports = {
    name: "donate",
    category: "support",
    description: "Provides a link to support the creator of the bot ❤️.",
    permissions: "member",
    run: (client, message, args) => {
        const donationLink = "https://www.linktr.ee/comicallybad";
        return r(message.channel, message.author, `The donation link to support the bot creator is: ${donationLink}`).then(m => del(m, 15000));
    }
}