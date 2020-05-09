const { del } = require("../../functions.js");
const { MessageEmbed } = require("discord.js");
const xp = require('../../schemas/xp.js');

module.exports = {
    name: "leaderboard",
    aliases: ["leaderboards", "xpleaderboard", "xpleaderboards"],
    category: "leveling",
    description: "Shows the top level users in the discord server.",
    permissions: "moderator",
    usage: "<@user|userID> <amount>",
    run: (client, message, args) => {
        let guildID = message.guild.id;
        xp.find({ guildID: guildID }, (err, exists) => {
            if (exists) {
                const embed = new MessageEmbed()
                    .setTitle("XP Leaderboard Top 10")
                    .setColor("#0efefe")
                    .setTimestamp()

                let sorted = exists;
                let temp;

                for (var i = 0; i < sorted.length; i++) {
                    for (var j = 0; j < sorted.length - 1 - i; j++) {
                        if (sorted[j].xp > sorted[j + 1].xp) {
                            temp = sorted[j]
                            sorted[j] = sorted[j + 1];
                            sorted[j + 1] = temp;
                        }
                    }
                }

                let count = 1;
                if (sorted.length >= 10) {
                    for (i = sorted.length - 1; i > sorted.length - 11; i--) {
                        embed.addField(`#${count}`, `**${sorted[i].userName}, level: ${sorted[i].level}, XP: ${sorted[i].xp}**`)
                        count++;
                    }
                } else {
                    for (i = sorted.length - 1; i >= 0; i--) {
                        embed.addField(`**#${count}:**`, `**${sorted[i].userName}, level: ${sorted[i].level}, XP: ${sorted[i].xp}**`)
                        count++;
                    }
                }
                message.channel.send(embed).then(m => del(m, 30000));
            } else {
                return message.reply("There was an error finding users within this server.").then(m => del(m, 7500));
            }
        })
    }
}