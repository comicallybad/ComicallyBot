const { del } = require("../../functions.js");
const db = require('../../schemas/db.js');
const { stripIndents } = require("common-tags");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "removebadword",
    aliases: ["badwordremove", "removeword"],
    category: "moderation",
    description: "Removes a word from the list of bad words that will be deleted.",
    permissions: "moderator",
    usage: "<word>",
    run: (client, message, args) => {
        const logChannel = message.guild.channels.cache.find(c => c.name === "mod-logs") || message.channel;
        let guildID = message.guild.id;

        if (!args[0])
            return message.reply("Please provide a word to you wish to allow.").then(m => del(m, 7500));

        const embed = new MessageEmbed()
            .setColor("#0efefe")
            .setTitle("Bad Word Removed")
            .setThumbnail(message.author.displayAvatarURL())
            .setFooter(message.member.displayName, message.author.displayAvatarURL())
            .setTimestamp()
            .setDescription(stripIndents`
            **Bad Word Removed by:** ${message.member.user}
            **Bad Word Removed:** ${args[0]}`);

        db.updateOne({ guildID: guildID }, {
            $pull: { badWordList: `${args[0]}` }
        }).catch(err => console.log(err))

        message.reply("Removing bad word if it exists in the list...").then(m => del(m, 7500));

        return logChannel.send(embed);
    }
}