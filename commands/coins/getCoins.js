const { getCommandStatus, hasPermissions } = require("../../functions.js");
const coins = require('../../schemas/coins.js');

module.exports = {
    name: "getcoins",
    aliases: ["coins", "mycoins"],
    category: "coins",
    description: "Get number of coins",
    permissions: "member",
    usage: "[@user|userID]",
    run: (client, message, args) => {
        getCommandStatus(message, "getcoins").then(function (res) {
            if (!res) message.reply("Command disabled").then(m => m.delete(7500));
            if (res) {
                hasPermissions(message, "member").then(async function (res) {
                    if (!res) message.reply("You do not have permissions for this command.").then(m => m.delete(7500))
                    if (res) {
                        let guildID = message.guild.id;
                        let userID = message.member.id;
                        let userIDs = message.guild.members.map(role => role.user.id);
                        let userMention;

                        if (!args[0])
                            addCoins(userID)

                        if (args[0])
                            userMention = args[0].slice(2, args[0].length - 1)

                        if (userIDs.includes(args[0]))
                            addCoins(args[0])

                        if (userIDs.includes(userMention))
                            addCoins(userMention)

                        function addCoins(usrID) {
                            message.delete();
                            coins.findOne({ guildID: guildID, userID: usrID }, (err, exists) => {
                                if (!exists) return message.reply("User doesn't have coins yet.").then(m => m.delete(7500));
                                if (exists.coins) return message.reply("User has: " + exists.coins + " coins").then(m => m.delete(7500));
                                else return message.reply("User has no coins").then(m => m.delete(7500));
                            })
                        }
                    }
                })
            }
        })
    }
}