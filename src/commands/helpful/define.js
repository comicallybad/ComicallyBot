const { s, r, del } = require("../../../utils/functions/functions.js");
const { EmbedBuilder } = require("discord.js");
var wd = require("word-definition");

module.exports = {
    name: "define",
    category: "helpful",
    description: "Defines a word for you.",
    permissions: "member",
    usage: "<word to define>",
    run: async (client, message, args) => {
        if (!args[0])
            return r(message.channel, message.author, "Please provide a word to be searched.").then(m => del(m, 7500));

        return await wd.getDef(`${args[0]}`, "en", null, function (result) {
            if (!result.definition)
                return s(message.channel, "Sorry, I could not find that word.").then(m => del(m, 7500));

            if (result.definition.length >= 1024)
                return r(message.channel, message.author, "This definition is too long of a string for a message embed sorry!").then(m => del(m, 7500));

            const embed = new EmbedBuilder()
                .setColor("#0efefe")
                .setAuthor({ name: `${message.member.displayName}`, iconURL: message.author.displayAvatarURL() })
                .setTitle(`Definition of: ${args[0]}`)
                .setDescription(result.definition)
                .setFooter({ text: `Category of type: ${result.category}` })
                .setTimestamp()

            return s(message.channel, '', embed).then(m => del(m, 30000));
        });
    }
}