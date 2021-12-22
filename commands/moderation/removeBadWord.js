const { s, del } = require("../../functions.js");
const db = require('../../schemas/db.js');
const { stripIndents } = require("common-tags");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "removebadword",
    aliases: ["removeword", "removebadwords", "removewords"],
    category: "moderation",
    description: "Removes a word from the list of bad words that will be deleted.",
    permissions: "moderator",
    usage: "<word | words separated by space>",
    run: (client, message, args) => {
        const logChannel = message.guild.channels.cache.find(c => c.name.includes("mod-logs")) || message.channel;
        let guildID = message.guild.id;

        if (!args[0])
            return r(message.channel, message.author, "Please provide a word or words separated by a space you wish to remove from the list.").then(m => del(m, 7500));

        const embed = new MessageEmbed()
            .setColor("#0efefe")
            .setTitle("Bad Word Removed")
            .setThumbnail(message.author.displayAvatarURL())
            .setFooter(message.member.displayName, message.author.displayAvatarURL())
            .setTimestamp()
            .setDescription(stripIndents`
            **Bad Word(s) Removed by:** ${message.member.user}
            **Bad Word(s) Removed:** ${args.map(word => `\`${word}\``).join(',')}`);

        args.forEach(word => {
            db.updateOne({ guildID: guildID }, {
                $pull: { badWordList: `${word}` }
            }).catch(err => console.log(err))
        })
        r(message.channel, message.author, "Removing bad word(s) from the list...").then(m => del(m, 7500));

        return s(logChannel, '', embed);
    }
}