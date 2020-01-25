const coins = require('../../schemas/coins.js');
const { findID } = require("../../functions.js");

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
            if (!ID) return message.reply("User not found.").then(m => m.delete(7500));
            else getCoins(ID);
        }

        function getCoins(usrID) {
            if (message.deletable) message.delete();
            coins.findOne({ guildID: guildID, userID: usrID }, (err, exists) => {
                if (!exists) return message.reply("User doesn't have coins yet.").then(m => m.delete(7500));
                if (exists.coins) return message.reply("User has: " + exists.coins + " coins").then(m => m.delete(7500));
                else return message.reply("User has no coins").then(m => m.delete(7500));
            })
        }
    }
}