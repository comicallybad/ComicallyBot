const { del, findID } = require("../../functions.js");
const coins = require('../../schemas/coins.js');

module.exports = {
    name: "getcoins",
    aliases: ["coins", "mycoins"],
    category: "coins",
    description: "Get number of coins.",
    permissions: "member",
    usage: "[@user|userID]",
    run: (client, message, args) => {
        let guildID = message.guild.id;
        let userID = message.member.id;

        if (!args[0]) getCoins(userID);
        else {
            let ID = findID(message, args[0], "user");
            if (!ID) return message.reply("User not found.").then(m => del(m, 7500));
            else getCoins(ID);
        }

        function getCoins(usrID) {
            coins.findOne({ guildID: guildID, userID: usrID }, (err, exists) => {
                if (!exists) return message.reply("User doesn't have coins yet.").then(m => del(m, 7500));
                if (exists.coins) return message.reply("User has: " + exists.coins + " coins").then(m => del(m, 7500));
                else return message.reply("User has no coins").then(m => del(m, 7500));
            })
        }
    }
}