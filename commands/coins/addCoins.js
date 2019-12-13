const coins = require('../../schemas/coins.js');
const mongoose = require("mongoose");

const { stripIndents } = require("common-tags");
const { RichEmbed } = require("discord.js");

module.exports = {
    name: "addcoins",
    aliases: ["coinsadd"],
    category: "coins",
    description: "Add coins to user",
    permissions: "moderator",
    usage: "<@user|userID> <amount>",
    run: (client, message, args) => {
        const logChannel = message.guild.channels.find(c => c.name === "mods-log") || message.channel;
        if (message.deletable) message.delete();
        let guildName = message.guild.name;
        let guildID = message.guild.id;
        let userIDs = message.guild.members.map(user => user.user.id);
        let userNames = message.guild.members.map(user => user.user.username);

        if (!args[0])
            return message.reply("Please provide a user.").then(m => m.delete(7500));

        let userMention = args[0].slice(2, args[0].length - 1);

        if (!args[1])
            return message.reply("Please provide amount of coins.").then(m => m.delete(7500));

        if (isNaN(args[1]) || parseInt(args[1]) <= 0)
            return message.reply("Please provide a valid amount above 0.").then(m => m.delete(7500));

        if (userIDs.includes(args[0]))
            addCoins(args[0], parseInt(args[1]))

        if (userIDs.includes(userMention))
            addCoins(userMention, parseInt(args[1]))

        if (!userIDs.includes(args[0]) && !userIDs.includes(userMention))
            return message.reply("User not found.").then(m => m.delete(7500));

        function addCoins(userID, coinsToAdd) {
            let userName = userNames[userIDs.indexOf(userID)];

            coins.findOne({ guildID: guildID, userID: userID }, (err, exists) => {
                if (!exists) {
                    const newCoins = new coins({
                        _id: mongoose.Types.ObjectId(),
                        guildID: guildID, guildName: guildName,
                        userID: userID, userName: "USERNAME PLACEHOLDER", coins: coinsToAdd
                    })
                    newCoins.save().catch(err => console.log(err));
                } else {
                    exists.coins += coinsToAdd
                    exists.save().catch(err => console.log(err));

                    const embed = new RichEmbed()
                        .setColor("#0efefe")
                        .setThumbnail(message.member.displayAvatarURL)
                        .setFooter(message.member.displayName, message.author.displayAvatarURL)
                        .setTimestamp()
                        .setDescription(stripIndents`**> Coins Added by:** ${message.member.user.username} (${message.member.id})
                        **> Coins Given to:** ${userName} (${userID})
                        **> Coins Given:** ${coinsToAdd}`);

                    logChannel.send(embed);

                    return message.reply(coinsToAdd + " coins were added to the user.").then(m => m.delete(7500))
                }
            }).catch(err => console.log(err))
        }
    }
}