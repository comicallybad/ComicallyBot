const { s, del } = require("../../functions.js");
const db = require('../../schemas/db.js');
const { stripIndents } = require("common-tags");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "addbadwords",
    aliases: ["addwords", "addword", "addbadword"],
    category: "moderation",
    description: "Adds a word to a list of bad words that will be deleted.",
    permissions: "moderator",
    usage: "<word | words separated by space>",
    run: (client, message, args) => {
        const logChannel = message.guild.channels.cache.find(c => c.name.includes("mod-logs")) || message.channel;
        let guildID = message.guild.id;

        if (!args[0])
            return r(message.channel, message.author, "Please provide a word or words separated by a space you wish to disallow.").then(m => del(m, 7500));

        const embed = new MessageEmbed()
            .setColor("#0efefe")
            .setTitle("Bad Word Added")
            .setThumbnail(message.author.displayAvatarURL())
            .setFooter(message.member.displayName, message.author.displayAvatarURL())
            .setTimestamp()
            .setDescription(stripIndents`
            **Bad Word(s) Added by:** ${message.member.user}
            **Bad Word(s) Added:** ${args.map(word => `\`${word}\``).join(',')}`);

        args.forEach(word => {
            db.findOne({ guildID: guildID, badWordList: `${word}` }, (err, exists) => {
                if (exists) return;
                else {
                    db.updateOne({ guildID: guildID }, {
                        $push: { badWordList: `${word}` }
                    }).catch(err => console.log(err))
                }
            })
        })

        r(message.channel, message.author, "Adding bad word(s) to the list...").then(m => del(m, 7500));

        return s(logChannel, '', embed);
    }
}