const { del, findID } = require("../../functions.js");
const coins = require('../../schemas/coins.js');
const { stripIndents } = require("common-tags");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "setcoins",
    aliases: ["coinsset"],
    category: "coins",
    description: "Set coins for a user.",
    permissions: "moderator",
    usage: "<@user|userID> <amount>",
    run: (client, message, args) => {
        const logChannel = message.guild.channels.cache.find(c => c.name === "mod-logs") || message.channel;

        let guildID = message.guild.id;
        let userIDs = message.guild.members.cache.map(user => user.user.id);
        let userNames = message.guild.members.cache.map(user => user.user.username);

        if (!args[0])
            return message.reply("Please provide a user.").then(m => del(m, 7500));

        if (!args[1])
            return message.reply("Please provide amount of coins.").then(m => del(m, 7500));

        if (isNaN(args[1]) || parseInt(args[1]) < 0)
            return message.reply("Please provide a valid amount greater than or equal to 0.").then(m => del(m, 7500));

        let ID = findID(message, args[0], "user");

        if (!ID) return message.reply("User not found.").then(m => del(m, 7500));
        else setCoins(ID, Math.floor(parseInt(args[1])));

        function setCoins(userID, coinsToSet) {
            let userName = userNames[userIDs.indexOf(userID)];

            coins.updateOne({ guildID: guildID, userID: userID }, {
                $set: { coins: coinsToSet }
            }).then(function () {
                const embed = new MessageEmbed()
                    .setColor("#0efefe")
                    .setThumbnail(message.author.displayAvatarURL())
                    .setFooter(message.member.displayName, message.author.displayAvatarURL())
                    .setTimestamp()
                    .setDescription(stripIndents`
                **> Coins Set by:** <@${message.member.id}> ${message.member.user.username} (${message.member.id})
                **> User's Coins Set:** <@${userID}> ${userName} (${userID})
                **> Coins Set to:** ${coinsToSet}`);

                logChannel.send(embed);

                return message.reply("User was set to: " + coinsToSet + " coins").then(m => del(m, 7500));

            }).catch(err => console.log(err))
        }
    }
}