const { del, pageList } = require("../../functions");
const { MessageEmbed } = require("discord.js");
const xp = require('../../schemas/xp.js');

module.exports = {
    name: "globalleaderboard",
    aliases: ["leaderboardglobal", "xpgloballeaderboard", "globalleaderboards"],
    category: "leveling",
    description: "Shows the top level users out of all servers.",
    permissions: "member",
    run: (client, message, args) => {
        xp.find({}, async (err, exists) => {
            if (exists) {
                let sorted = exists;
                let temp;
                const embed = new MessageEmbed()
                    .setTitle("Global XP Leaderboards")
                    .setDescription(`Global XP leaderboard users: ${sorted.length}`)
                    .setColor("#0efefe")
                    .setTimestamp()

                const m = await message.channel.send(embed);

                for (var i = 0; i < sorted.length; i++) {
                    for (var j = 0; j < sorted.length - 1 - i; j++) {
                        if (sorted[j].xp < sorted[j + 1].xp) {
                            temp = sorted[j]
                            sorted[j] = sorted[j + 1];
                            sorted[j + 1] = temp;
                        }
                    }
                }

                if (sorted.length > 0) {
                    if (sorted.length <= 10) {
                        sorted.forEach((user, index) => {
                            embed.addField(`#${index + 1}:`, `**${user.userName}, level: ${user.level}, XP: ${user.xp}**`)
                        });
                        return m.edit(embed).then(del(m, 30000)).catch(err => err);
                    } else {
                        let array = sorted.map(user => `**${user.userName}, level: ${user.level}, XP: ${user.xp}**`);
                        pageList(m, message.author, array, embed, "#")
                    }
                } else {
                    embed.setDescription("").addField("XP Leaderboards", "There are no users on the leaderboards.")
                    return m.edit(embed).then(del(m, 30000)).catch(err => err);
                }
            }
        })
    }
}