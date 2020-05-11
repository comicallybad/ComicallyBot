const { del, findID } = require("../../functions.js");
const xp = require('../../schemas/xp.js');
const { stripIndents } = require("common-tags");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "getxp",
    aliases: ["rank", "getrank", "xp"],
    category: "leveling",
    description: "Get members rank.",
    permissions: "member",
    usage: "[@user|userID]",
    run: (client, message, args) => {
        let guildID = message.guild.id;
        let userID = message.member.id;

        if (!args[0]) getRank(userID);
        else {
            let ID = findID(message, args[0], "user");
            if (!ID) return message.reply("User not found.").then(m => del(m, 7500));
            else getRank(ID);
        }

        function getRank(usrID) {
            xp.findOne({ guildID: guildID, userID: usrID }, (err, exists) => {
                if (!exists) return message.reply("User doesn't have a rank yet.").then(m => del(m, 7500));
                if (exists) {
                    let rankupXP = Number;

                    if (exists.level == 0) rankupXP = 10 - exists.xp;
                    else rankupXP = 10 * Math.pow(exists.level + 1, 3) / 5 - exists.xp;

                    const embed = new MessageEmbed()
                        .setColor("#0efefe")
                        .setTitle("Rank")
                        .setTimestamp()
                        .setDescription(stripIndents`
                        **> User is level: ${exists.level}**
                        **> User has: ${exists.xp} XP**
                        **> XP Until Next Level: ${rankupXP}**`);

                    return message.reply(embed).then(m => del(m, 30000));
                } else return message.reply("User has no rank").then(m => del(m, 7500));
            })
        }
    }
}