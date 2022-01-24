const { s, r, del } = require("../../functions.js");
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
                if (quote.text.length <= 1024) {
                    embed.setTitle(`Here's a quote from: ${quote.author}`);
                    embed.setDescription(`${quote.text}`);
                    embed.setFooter({ text: quote.author, iconURL: message.author.displayAvatarURL() });
                    return s(message.channel, '', embed).then(m => del(m, 30000));
                } else r(message.channel, message.author, "This quote was too long to fit in an Embed.").then(m => del(m, 7500));
            }).catch(err => {
                return r(message.channel, message.author, `Error finding random quote. ${err}`).then(m => del(m, 7500));
            });
    }
}