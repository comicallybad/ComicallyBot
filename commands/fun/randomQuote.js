const { r, del } = require("../../functions.js");
const { MessageEmbed } = require("discord.js");
const getRandomQuote = require('get-random-quote');

module.exports = {
    name: "randomquote",
    aliases: ["rquote"],
    category: "fun",
    description: "Says a random quote from an author",
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
                return r(message.channel, message.author, '', embed).then(m => del(m, 30000));
            }).catch(err => {
                return r(message.channel, message.author, `Error finding random quote. ${err}`).then(m => del(m, 7500));
            });
    }
}