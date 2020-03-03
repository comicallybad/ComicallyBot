const coins = require('../../schemas/coins.js');
const mongoose = require("mongoose");
const { findID } = require("../../functions.js");

const { stripIndents } = require("common-tags");
const { RichEmbed } = require("discord.js");

module.exports = {
    name: "setcoins",
    aliases: ["coinsset"],
    category: "coins",
    description: "Set coins for a user.",
    permissions: "moderator",
    usage: "<@user|userID> <amount>",
    run: (client, message, args) => {
        const logChannel = message.guild.channels.find(c => c.name === "mods-log") || message.channel;

        let guildName = message.guild.name;
        let guildID = message.guild.id;
        let userIDs = message.guild.members.map(user => user.user.id);
        let userNames = message.guild.members.map(user => user.user.username);

        if (!args[0])
            return message.reply("Please provide a user.").then(m => m.delete(7500));

        if (!args[1])
            return message.reply("Please provide amount of coins.").then(m => m.delete(7500));

        if (isNaN(args[1]) || parseInt(args[1]) < 0)
            return message.reply("Please provide a valid amount greater than or equal to 0.").then(m => m.delete(7500));

        let ID = findID(message, args[0], "user");

        if (!ID) return message.reply("User not found.").then(m => m.delete(7500));
        else setCoins(ID, Math.floor(parseInt(args[1])));

        function setCoins(userID, coinsToSet) {
            let userName = userNames[userIDs.indexOf(userID)];

            coins.findOne({ guildID: guildID, userID: userID }, (err, exists) => {
                if (!exists) {
                    const newCoins = new coins({
                        _id: mongoose.Types.ObjectId(),
                        guildID: guildID, guildName: guildName,
                        userID: userID, userName: "USERNAME PLACEHOLDER", coins: coinsToSet
                    })
                    newCoins.save().catch(err => console.log(err));
                } else {
                    exists.coins = coinsToSet
                    exists.save().catch(err => console.log(err));

                    const embed = new RichEmbed()
                        .setColor("#0efefe")
                        .setThumbnail(message.member.displayAvatarURL)
                        .setFooter(message.member.displayName, message.author.displayAvatarURL)
                        .setTimestamp()
                        .setDescription(stripIndents`
                        **> Coins Set by:** <@${message.member.id}> ${message.member.user.username} (${message.member.id})
                        **> User's Coins Set:** <@${userID}> ${userName} (${userID})
                        **> Coins Set to:** ${coinsToSet}`);

                    logChannel.send(embed);

                    return message.reply("User was set to: " + coinsToSet + " coins").then(m => m.delete(7500));
                }
            }).catch(err => console.log(err));
        }
    }
}