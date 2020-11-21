const { del } = require("../../functions.js");
const { MessageEmbed } = require("discord.js");
var wd = require("word-definition");

module.exports = {
    name: "define",
    aliases: ["dict", "dictionary"],
    category: "helpful",
    description: "Defines a word for you.",
    permissions: "member",
    usage: "<word to define>",
    run: (client, message, args) => {
        if (!args[0])
            return message.reply("Please provide a word to be searched.").then(m => del(m, 7500));


        wd.getDef(`${args[0]}`, "en", null, function (result) {
            if (result.definition) {
                const embed = new MessageEmbed()
                    .setColor("#0efefe")
                    .setAuthor(`${message.member.user.tag}`, `${message.author.displayAvatarURL()}`)
                    .setTitle(`Definition of: ${args[0]}`)
                    .setDescription(result.definition)
                    .setFooter(`Category of type: ${result.category}`)
                    .setTimestamp()

                return message.reply(embed).then(m => del(m, 30000));
            } else return message.reply("Sorry, I could not find that word.").then(m => del(m, 7500));
        });
    }
}