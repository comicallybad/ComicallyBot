const { s, e, del, pageList } = require("../../functions");
const { MessageEmbed } = require("discord.js");
const xp = require('../../schemas/xp.js');

module.exports = {
    name: "globalleaderboard",
    aliases: ["globalleaderboards", "globalranks", "ranksglobal"],
    category: "leveling",
    description: "Shows the top level users out of all servers.",
    permissions: "member",
    run: (client, message, args) => {
        return xp.find({}, async (err, exists) => {
            if (!exists) return;
            let sorted = exists.sort((a, b) => b.xp - a.xp);

            const embed = new MessageEmbed()
                .setTitle("Global XP Leaderboards")
                .setDescription(`Global XP Member Count: ${sorted.length}`)
                .setColor("#0efefe")
                .setTimestamp()

            const m = await s(message.channel, '', embed);

            if (sorted.length > 0) {
                if (sorted.length <= 10) {
                    sorted.forEach((user, index) => {
                        embed.addField(`Rank ${index + 1}:`, `**${user.userName}, level: ${user.level}, XP: ${user.xp}**`);
                    });
                    return e(m, m.channel, '', embed).then(del(m, 30000));
                } else {
                    let array = sorted.map(user => `**${user.userName}, level: ${user.level}, XP: ${user.xp}**`);
                    pageList(m, message.author, array, embed, "Rank", 10, 0);
                }
            } else {
                embed.setDescription("").addField("XP Leaderboards", "There are no users on the leaderboards.");
                return e(m, m.channel, '', embed).then(del(m, 30000));
            }
        }).catch(err => err);
    }
}