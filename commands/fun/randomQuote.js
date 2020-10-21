const { del } = require("../../functions.js");
const { MessageEmbed } = require("discord.js");
const getRandomQuote = require('get-random-quote');

module.exports = {
    name: "randomquote",
    aliases: ["rquote", "quoterandom"],
    category: "fun",
    description: "Says a random form of encouragement.",
    permissions: "member",
    run: (client, message, args) => {
        let embed = new MessageEmbed()
            .setColor("#0efefe")
            .setTimestamp()

        getRandomQuote()
            .then(quote => {
                embed.setTitle(`Here's a quote from: ${quote.author}`);
                embed.setDescription(`${quote.text}`);
                embed.setFooter(`${quote.author}`, message.author.displayAvatarURL());
                return message.reply(embed).then(m => del(m, 30000));
            }).catch(err => {
                return message.reply(`Error finding random quote. ${err}`).then(m => del(m, 7500));
            });
    }
}