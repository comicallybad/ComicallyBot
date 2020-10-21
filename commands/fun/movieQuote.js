const { del } = require("../../functions.js");
const { MessageEmbed } = require("discord.js");
const movieQuote = require("popular-movie-quotes");

module.exports = {
    name: "moviequote",
    aliases: ["quotemovie", "rmquote"],
    category: "fun",
    description: "Says a quote from a movie provided, or a random movie.",
    usage: "[movie title]",
    permissions: "member",
    run: (client, message, args) => {
        let embed = new MessageEmbed()
            .setColor("#0efefe")
            .setTimestamp()

        if (args[0]) {
            let quote = movieQuote.getQuotesByMovie(args.join(' '));
            if (quote[0]) {
                embed.setTitle(`Here's a quote from: ${args.join(' ')}`);
                embed.setDescription(`${quote[0].quote}`);
                embed.setFooter(`${args.join(' ')} ${quote[0].year}`, message.author.displayAvatarURL())
                return message.reply(embed).then(m => del(m, 30000));
            } else return message.reply("Could not find a quote from that movie.").then(m => del(m, 7500));
        }
        else {
            let quote = movieQuote.getRandomQuote();
            embed.setTitle(`Here's a random movie quote`);
            embed.setDescription(`${quote}`);
            embed.setFooter(`Random movie quote`, message.author.displayAvatarURL())
            return message.reply(embed).then(m => del(m, 30000));
        }
    }
}