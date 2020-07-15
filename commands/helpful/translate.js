const { del } = require("../../functions.js");
const translate = require('google-translate-free');

module.exports = {
    name: "translate",
    aliases: ["translation"],
    category: "helpful",
    description: "Translates a message for you.",
    permissions: "member",
    usage: "<message to translate>",
    run: (client, message, args) => {
        if (!args[0])
            return message.reply("Please provide something to translate.").then(m => del(m, 7500));
        else {
            translate(`${args.join(' ')}`, { to: 'en' }).then(res => {
                return message.reply(`**Translation:** ${res.text}. **Translated from:** \`${res.from.language.iso}\``);
            }).catch(err => {
                return message.reply(`There was an error translating: ${err}`);
            });
        }
    }
}