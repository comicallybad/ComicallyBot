const { del } = require("../../functions.js");
const db = require('../../schemas/db.js');
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "getbadwords",
    aliases: ["badwords", "words", "getwords"],
    category: "moderation",
    description: "Returns a list of bad words that will be deleted.",
    permissions: "moderator",
    run: (client, message, args) => {
        let guildID = message.guild.id;
        let badWordList;

        const embed = new MessageEmbed()
            .setColor("#0efefe")
            .setTitle("Bad Word List")
            .setFooter(message.member.displayName, message.author.displayAvatarURL())
            .setTimestamp()

        db.findOne({ guildID: guildID }, (err, exists) => {
            if (exists) {
                if (exists.badWordList.length > 0) {
                    badWordList = exists.badWordList.map(word => `\`${word}\``).join(',');
                    embed.setDescription(badWordList);
                    return message.channel.send(embed).then(m => del(m, 30000));
                } else {
                    embed.setDescription("No bad words have been set.");
                    return message.channel.send(embed).then(m => del(m, 7500));
                }
            } else {
                return message.reply("There have been no bad words set yet.")
            }
        });
    }
}