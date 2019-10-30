const coins = require('../../schemas/coins.js');
const mongoose = require("mongoose");

module.exports = {
    name: "addcoins",
    aliases: ["coinsadd"],
    category: "coins",
    description: "Add coins to user",
    permissions: "moderator",
    usage: "<@user|userID> <amount>",
    run: (client, message, args) => {
        if (message.deletable) message.delete();
        let guildName = message.guild.name;
        let guildID = message.guild.id;
        let userIDs = message.guild.members.map(role => role.user.id);

        if (!args[0])
            return message.reply("Please provide a user.").then(m => m.delete(7500));

        let userMention = args[0].slice(2, args[0].length - 1);

        if (!args[1])
            return message.reply("Please provide amount of coins.").then(m => m.delete(7500));

        if (isNaN(args[1]))
            return message.reply("Please provide a number amount of coins").then(m => m.delete(7500));

        if (userIDs.includes(args[0]))
            addCoins(args[0], parseInt(args[1]))

        if (userIDs.includes(userMention))
            addCoins(userMention, parseInt(args[1]))

        if (!userIDs.includes(args[0]) && !userIDs.includes(userMention))
            return message.reply("User not found.").then(m => m.delete(7500));

        function addCoins(usrID, coinsToAdd) {
            coins.findOne({ guildID: guildID, userID: usrID }, (err, exists) => {
                if (!exists) {
                    const newCoins = new coins({
                        _id: mongoose.Types.ObjectId(),
                        guildID: guildID, guildName: guildName,
                        userID: usrID, userName: "USERNAME PLACEHOLDER", coins: coinsToAdd
                    })
                    newCoins.save().catch(err => console.log(err));
                } else {
                    exists.coins += coinsToAdd
                    exists.save().catch(err => console.log(err));
                }
            }).catch(err => console.log(err))
            return message.reply(coinsToAdd + " coins were added to the user.").then(m => m.delete(7500))
        }
    }
}