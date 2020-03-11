const { del, awaitReaction } = require("../../functions.js");
const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");
const coins = require('../../schemas/coins.js');
const mongoose = require("mongoose")

module.exports = {
    name: "giveaway",
    aliases: ["coinsgiveaway"],
    category: "coins",
    description: "Giveaway for coins",
    permissions: "moderator",
    usage: "<amount> <time>",
    run: async (client, message, args) => {
        const logChannel = message.guild.channels.cache.find(c => c.name === "mods-log") || message.channel;

        let guildID = message.guild.id;
        let guildName = message.guild.name;

        if (!args[0])
            return message.reply("Please provide an amount of coins.").then(m => del(m, 7500));

        if (!args[1])
            return message.reply("Please provide an amount of time.").then(m => del(m, 7500));

        if (isNaN(args[0]))
            return message.reply("Please provide a valid number of coins").then(m => del(m, 7500));

        if (isNaN(args[1]))
            return message.reply("Please provide a valid number for time.").then(m => del(m, 7500));

        let amount = Math.floor(args[0]);
        let time = Math.floor(args[1] * 60000);

        if (amount < 1 || time < 1)
            return message.reply("Please provide numbers greater than or equal to 1.").then(m => del(m, 7500));

        let embed = new MessageEmbed()
            .setTitle("**React below for the giveaway!**")
            .setDescription(`The giveaway is for ${amount} coins, and is going for ${Math.floor(args[1])} minute(s)`)
            .setFooter(`${amount} coins for ${Math.floor(args[1])} minute(s)`, message.author.displayAvatarURL())
            .setTimestamp();

        message.channel.send(embed).then(async msg => {
            const users = await awaitReaction(msg, 7500, "💯");

            if (users.length > 0) {
                const random = Math.floor(Math.random() * users.length);
                let userID = users[random].id;
                let userName = users[random].username;

                msg.reactions.removeAll();

                embed
                    .setDescription(`Congrats <@${userID}>, you are the winner of the ${amount} coins giveaway!`)
                    .setFooter(`${userName} won ${amount} coins!`, message.author.displayAvatarURL());

                coins.findOne({ guildID: guildID, userID: userID }, (err, exists) => {
                    if (!exists) {
                        const newCoins = new coins({
                            _id: mongoose.Types.ObjectId(),
                            guildID: guildID, guildName: guildName,
                            userID: userID, userName: "USERNAME PLACEHOLDER", coins: amount
                        });
                        newCoins.save().catch(err => console.log(err));
                    } else {
                        exists.coins += amount;
                        exists.save().catch(err => console.log(err));

                        const logEmbed = new MessageEmbed()
                            .setColor("#0efefe")
                            .setThumbnail(message.author.displayAvatarURL())
                            .setFooter(message.member.displayName, message.author.displayAvatarURL())
                            .setTimestamp()
                            .setDescription(stripIndents`
                                **> Coins Giveaway by:** <@${message.member.id}> ${message.member.user.username} (${message.member.id})
                                **> Coins Giveaway won by:** <@${userID}> ${userName} (${userID})
                                **> Coins Given:** ${amount}`);

                        logChannel.send(logEmbed);
                    }
                }).catch(err => console.log(err));

                msg.edit(embed);

            } else {
                msg.reactions.removeAll();

                embed
                    .setDescription(`There were no winners awarded, not enough reactions!`)
                    .setFooter(`No one won the ${amount} coins!`, message.author.displayAvatarURL());

                msg.edit(embed);
            }
        });
    }
}