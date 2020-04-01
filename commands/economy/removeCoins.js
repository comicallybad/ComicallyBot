const { del, findID } = require("../../functions.js");
const coins = require('../../schemas/coins.js');
const { stripIndents } = require("common-tags");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "removecoins",
    aliases: ["coinsremove"],
    category: "economy",
    description: "Remove coins to user.",
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

        if (isNaN(args[1]) || parseInt(args[1]) <= 0)
            return message.reply("Please provide a valid amount above 0.").then(m => del(m, 7500));

        let ID = findID(message, args[0], "user");

        if (!ID) return message.reply("User not found.").then(m => del(m, 7500));
        else removeCoins(ID, Math.floor(parseInt(args[1])));

        function removeCoins(userID, coinsToRemove) {
            let userName = userNames[userIDs.indexOf(userID)];

            coins.findOne({ guildID: guildID, userID: userID }, (err, exists) => {
                if (!exists) return message.reply("This user has not yet been added to the database.").then(m => del(m, 7500));
                else {
                    if (exists.coins - coinsToRemove < 0) return message.reply("A user may not go below 0 coins").then(m => del(m, 7500));
                    else {
                        exists.coins -= coinsToRemove;
                        exists.save().catch(err => console.log(err));

                        const embed = new MessageEmbed()
                            .setColor("#0efefe")
                            .setThumbnail(message.author.displayAvatarURL())
                            .setFooter(message.member.displayName, message.author.displayAvatarURL())
                            .setTimestamp()
                            .setDescription(stripIndents`
                            **> Coins Removed by:** ${message.member.user}
                            **> User's Coins Removed:** <@${userID}> ${userName} (${userID})
                            **> Coins Removed:** ${coinsToRemove}`);

                        logChannel.send(embed);

                        return message.reply(coinsToRemove + " coins were removed to the user.").then(m => del(m, 7500));
                    }
                }
            }).catch(err => console.log(err))
        }
    }
}