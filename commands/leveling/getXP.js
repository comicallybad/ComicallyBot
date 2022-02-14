const { del, s, r, findID } = require("../../functions.js");
const xp = require('../../schemas/xp.js');
const Discord = require("discord.js");
const canvacord = require("canvacord");

module.exports = {
    name: "getxp",
    aliases: ["rank", "getrank", "xp"],
    category: "leveling",
    description: "Get members rank.",
    permissions: "member",
    usage: "[@user | userID]",
    run: async (client, message, args) => {
        let guildID = message.guild.id;
        let userID = message.member.id;

        if (!args[0]) getRank(userID);
        else {
            let ID = await findID(message, args[0], "user");
            if (!ID) return r(message.channel, message.author, "User not found.").then(m => del(m, 7500));
            else getRank(ID);
        }

        function getRank(usrID) {
            xp.findOne({ guildID: guildID, userID: usrID }, async (err, exists) => {
                if (!exists) return s(message.channel, "User doesn't have a rank yet.").then(m => del(m, 7500));
                if (exists) {
                    const rankupXP = 10 * Math.pow(exists.level + 1, 3) / 5 + 25
                    const member = await message.guild.members.fetch(usrID);
                    const rank = new canvacord.Rank()
                        .setAvatar(member.user.displayAvatarURL({ dynamic: false, format: 'png' }))
                        .setBackground("IMAGE", `${process.env.LEVELBACKGROUNDURL}`)
                        .setRank(1, 'RANK', false)
                        .setLevel(exists.level)
                        .setCurrentXP(exists.xp)
                        .setRequiredXP(rankupXP)
                        .setStatus("online", true, 0)
                        .setProgressBar("#0EFEFE", "COLOR")
                        .renderEmojis(true)
                        .setOverlay("#111111", 0.5, true)
                        .setUsername(`${member.nickname ? member.nickname : member.user.username}`)
                        .setDiscriminator(member.user.discriminator);

                    rank.build()
                        .then(data => {
                            const attachment = new Discord.MessageAttachment(data, "RankCard.png");
                            message.channel.send({ files: [attachment] }).then(m => del(m, 15000));
                        });
                }
            }).clone().catch(err => err);
        }
    }
}