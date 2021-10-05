const { del, pageList } = require("../../functions");
const { MessageEmbed } = require("discord.js");
const xp = require('../../schemas/xp.js');

module.exports = {
    name: "leaderboard",
    aliases: ["leaderboards", "xpleaderboard", "xpleaderboards"],
    category: "leveling",
    description: "Shows the top level users in the discord server.",
    permissions: "member",
    run: (client, message, args) => {
        let guildID = message.guild.id;
        xp.find({ guildID: guildID }, async (err, exists) => {
            if (exists) {
                let sorted = exists;
                let temp;
                const embed = new MessageEmbed()
                    .setTitle("XP Leaderboards")
                    .setDescription(`XP leaderboard users: ${sorted.length}`)
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
                            embed.addField(`#${index + 1}:`, `**${user.userNickname != null ? user.userNickname : user.userName}, level: ${user.level}, XP: ${user.xp}**`)
                        });
                        return m.edit(embed).then(del(m, 30000));
                    } else {
                        let array = sorted.map(user => `**${user.userNickname != null ? user.userNickname : user.userName}, level: ${user.level}, XP: ${user.xp}**`);
                        pageList(m, message.author, array, embed, "#")
                    }
                } else {
                    embed.setDescription("").addField("XP Leaderboards", "There are no users on the leaderboards.")
                    return m.edit(embed).then(del(m, 30000));
                }
            }
        })
    }
}