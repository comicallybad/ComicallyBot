const { del } = require("../../functions.js");
const db = require('../../schemas/db.js');
const { stripIndents } = require("common-tags");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "addbadword",
    aliases: ["badwordadd", "addword", "addbadwords", "badwordsadd", "addwords"],
    category: "moderation",
    description: "Adds a word to a list of bad words that will be deleted.",
    permissions: "moderator",
    usage: "<word | words separated by space>",
    run: (client, message, args) => {
        const logChannel = message.guild.channels.cache.find(c => c.name === "mod-logs") || message.channel;
        let guildID = message.guild.id;

        if (!args[0])
            return message.reply("Please provide a word to you wish to disallow.").then(m => del(m, 7500));

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

        message.reply("Adding bad word(s) to the list...").then(m => del(m, 7500));

        return logChannel.send(embed).catch(err => err);
    }
}