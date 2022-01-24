const { s, r, del } = require("../../functions.js");
const urban = require("urban");
const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");

module.exports = {
    name: "urbandictionary",
    aliases: ["urb", "urban"],
    category: "fun",
    description: "Gets an urban dictionary definition",
    usage: "<search term> | <random>",
    permissions: "member",
    run: (client, message, args) => {
        if (!args[0])
            return r(message.channel, message.author, "Please provide <search trerm> | <random>.").then(m => del(m, 7500));
        let search = args[0] !== "random" ? urban(args.join("")) : urban.random();
        try {
            search.first(res => {
                if (!res) return r(message.channel, message.author, "No results found for this topic, sorry!").then(m => del(m, 7500));
                let { word, definition, example, thumbs_up, thumbs_down, permalink, author } = res;

                let description = stripIndents`**Defintion:** ${definition || "No definition"}
                    **Example:** ${example || "No Example"}
                    **Upvotes:** ${thumbs_up || 0}
                    **Downvotes:** ${thumbs_down || 0}
                    **Link:** [link to ${word}](${permalink || "https://www.urbandictionary.com/"})`

                if (description.length >= 1024)
                    return r(message.channel, message.author, "This definition is too long of a string for a message embed sorry!").then(m => del(m, 7500));
                else {
                    let embed = new MessageEmbed()
                        .setColor("#0efefe")
                        .setAuthor({ name: `Urban Dictionary | ${word}` })
                        .setDescription(description)
                        .setTimestamp()
                        .setFooter({ text: `Written by ${author || "unknown"}` });

                    return s(message.channel, '', embed);
                }
            });
        } catch (err) {
            return s(message.channel, `Error while searching... ${err}`).then(m => del(m, 7500));
        }
    }
}