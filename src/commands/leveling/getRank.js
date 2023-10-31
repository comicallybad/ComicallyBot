const { del, s, r, findID } = require("../../../utils/functions/functions.js");
const xp = require("../../../utils/schemas/xp.js");
const Discord = require("discord.js");
const canvacard = require("canvacard");

module.exports = {
    name: "getrank",
    aliases: ["rank", "xp"],
    category: "leveling",
    description: "Get members rank.",
    permissions: "member",
    usage: "[@user | userID]",
    run: async (client, message, args) => {
        let guildID = message.guild.id;
        let userID = message.member.id;

        if (!args[0]) return getRank(userID);
        let ID = await findID(message, args[0]);
        if (!ID) return r(message.channel, message.author, "Member not found.").then(m => del(m, 7500));
        else getRank(ID);

        function getRank(usrID) {
            return xp.findOne({ guildID: guildID, userID: usrID }, async (err, exists) => {
                if (!exists) return s(message.channel, "Member doesn't have a rank yet.").then(m => del(m, 7500));
                const rankupXP = 10 * Math.pow(exists.level + 1, 3) / 5 + 25
                const member = await message.guild.members.fetch(usrID);
                const rank = new canvacard.Rank()
                    .setAvatar(member.user.displayAvatarURL({ dynamic: false, format: 'png' }))
                    .setBackground("IMAGE", `${process.env.LEVELBACKGROUNDURL}`)
                    .setRank(1, 'RANK', false)
                    .setLevel(exists.level)
                    .setPreviousRankXP(exists.level == 0 ? 0 : 10 * Math.pow((exists.level - 1) + 1, 3) / 5 + 25)
                    .setCurrentXP(exists.xp)
                    .setRequiredXP(rankupXP)
                    .setStatus("online", true, 0)
                    .setProgressBar("#0EFEFE", "COLOR")
                    .renderEmojis(true)
                    .setOverlay("#111111", 0.5, true)
                    .setUsername(`${member.nickname ? member.nickname : member.user.username}`)
                    .setDiscriminator(member.user.discriminator);

                rank.build().then(data => {
                    const attachment = new Discord.MessageAttachment(data, "RankCard.png");
                    return message.channel.send({ files: [attachment] });
                }).catch(err => { return r(message.channel, message.author, `There was an error building your rank card: ${err}`) })
            }).catch(err => err)
        }
    }
}