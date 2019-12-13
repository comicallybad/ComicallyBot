const coins = require('../../schemas/coins.js');
const { getMember } = require("../../functions.js");

module.exports = {
    name: "getcoins",
    aliases: ["coins", "mycoins"],
    category: "coins",
    description: "Get number of coins",
    permissions: "member",
    usage: "[@user|userID]",
    run: (client, message, args) => {
        let guildID = message.guild.id;
        let userID = message.member.id;
        let userIDs = message.guild.members.map(role => role.user.id);
        let userMention;

        if (!args[0]) {
            getCoins(userID)
        } else {
            userMention = args[0].slice(3, args[0].length - 1)

            if (userIDs.includes(args[0]))
                getCoins(args[0])

            if (userIDs.includes(userMention))
                getCoins(userMention)
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