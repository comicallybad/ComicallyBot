const { s, e, del, pageList } = require("../../functions");
const { MessageEmbed } = require("discord.js");
const xp = require('../../schemas/xp.js');

module.exports = {
    name: "leaderboard",
    aliases: ["leaderboards", "localranks", "rankslocal"],
    category: "leveling",
    description: "Shows the top level users in the discord server.",
    permissions: "member",
    run: (client, message, args) => {
        let guildID = message.guild.id;
        return xp.find({ guildID: guildID }, async (err, exists) => {
            if (!exists) return;
            let sorted = exists.sort((a, b) => b.xp - a.xp);

            const embed = new MessageEmbed()
                .setTitle("XP Leaderboards")
                .setDescription(`Local XP Member Count: ${sorted.length}`)
                .setColor("#0efefe")
                .setTimestamp()

            const m = await s(message.channel, '', embed);

            if (sorted.length > 0) {
                if (sorted.length <= 10) {
                    sorted.forEach((user, index) => {
                        embed.addField(`Rank ${index + 1}:`, `**${user.userNickname ? user.userNickname : user.userName}, level: ${user.level}, XP: ${user.xp}**`);
                    });
                    return e(m, m.channel, '', embed).then(del(m, 30000));
                } else {
                    let array = sorted.map(user => `**${user.userNickname ? user.userNickname : user.userName}, level: ${user.level}, XP: ${user.xp}**`);
                    pageList(m, message.author, array, embed, "Rank", 10, 0);
                }
            } else {
                embed.setDescription("").addField("XP Leaderboards", "There are no users on the leaderboards.");
                return e(m, m.channel, '', embed).then(del(m, 30000));
            }
        }).catch(err => err);
    }
}