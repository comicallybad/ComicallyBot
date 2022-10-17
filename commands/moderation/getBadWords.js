const { s, r, del } = require("../../functions.js");
const db = require('../../schemas/db.js');
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "getbadwords",
    aliases: ["badwords"],
    category: "moderation",
    description: "Returns a list of bad words added to the banned word list.",
    permissions: "moderator",
    run: (client, message, args) => {
        let guildID = message.guild.id;
        let badWordList;

        const embed = new MessageEmbed()
            .setTitle("Bad Word List")
            .setColor("#0efefe")
            .setFooter({ text: message.member.displayName, iconURL: message.author.displayAvatarURL() })
            .setTimestamp()
            .setDescription("Bad Word List.");

        return db.findOne({ guildID: guildID }, (err, exists) => {
            if (!exists) return r(message.channel, message.author, "There have been no bad words set yet.")
            if (exists.badWordList.length > 0) {
                badWordList = exists.badWordList.map(word => `\`${word}\``);
                embed.setDescription(`${badWordList}`);
                return s(message.channel, '', embed).then(m => del(m, 30000));
            } else {
                embed.setDescription("No bad words have been set.");
                return s(message.channel, '', embed).then(m => del(m, 7500));
            }
        }).catch(err => err);
    }
}