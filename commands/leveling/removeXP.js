const { del, findID } = require("../../functions.js");
const xp = require('../../schemas/xp.js');
const { stripIndents } = require("common-tags");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "removexp",
    aliases: ["xpremove"],
    category: "leveling",
    description: "Remove XP from user.",
    permissions: "moderator",
    usage: "<@user | userID> <amount>",
    run: (client, message, args) => {
        const logChannel = message.guild.channels.cache.find(c => c.name === "mod-logs") || message.channel;

        let guildID = message.guild.id;
        let userIDs = message.guild.members.cache.map(user => user.user.id);
        let userNames = message.guild.members.cache.map(user => user.user.username);

        if (!args[0])
            return message.reply("Please provide a user.").then(m => del(m, 7500));

        if (!args[1])
            return message.reply("Please provide amount of XP.").then(m => del(m, 7500));

        if (isNaN(args[1]) || parseInt(args[1]) <= 0)
            return message.reply("Please provide a valid amount above 0.").then(m => del(m, 7500));

        if (parseInt(args[1]) > 10000)
            return message.reply("You may not remove more than 10,000 XP from a user").then(m => del(m, 7500));

        let ID = findID(message, args[0], "user");

        if (!ID) return message.reply("User not found.").then(m => del(m, 7500));
        else removeXP(ID, Math.floor(parseInt(args[1])));

        function removeXP(userID, xpToRemove) {
            let userName = userNames[userIDs.indexOf(userID)];

            xp.findOne({ guildID: guildID, userID: userID }, (err, exists) => {
                if (!exists) return message.reply("This user has not yet been added to the database.").then(m => del(m, 7500));
                else {
                    if (exists.xp - xpToRemove < 0) return message.reply("A user may not go below 0 XP").then(m => del(m, 7500));
                    else {
                        exists.xp -= xpToRemove;
                        exists.save().catch(err => console.log(err));

                        const embed = new MessageEmbed()
                            .setColor("#0efefe")
                            .setTitle("XP Removed")
                            .setThumbnail(message.author.displayAvatarURL())
                            .setFooter(message.member.displayName, message.author.displayAvatarURL())
                            .setTimestamp()
                            .setDescription(stripIndents`
                            **XP Removed by: ${message.member.user}**
                            **User's XP Removed: <@${userID}> ${userName} (${userID})**
                            **XP Removed: ${xpToRemove}**`);

                        logChannel.send(embed);

                        return message.reply(xpToRemove + " XP was removed to the user.").then(m => del(m, 7500));
                    }
                }
            }).catch(err => console.log(err))
        }
    }
}