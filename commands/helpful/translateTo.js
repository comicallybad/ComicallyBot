const { r, del } = require("../../functions.js");
const translate = require('google-translate-free');

module.exports = {
    name: "translateto",
    aliases: ["translationto"],
    category: "helpful",
    description: "Translates a message to a specified language for you.",
    permissions: "member",
    usage: "<language code> <message to translate>",
    run: (client, message, args) => {
        if (!args[0])
            return r(message.channel, message.author, "Please provide a language code Ex: 'en' for english 'es' for spanish.").then(m => del(m, 7500));
        else {
            let translateToLanguage = args[0];
            translate(`${args.splice(1).join(' ')}`, { to: translateToLanguage }).then(res => {
                return r(message.channel, message.author, `**Translation:** ${res.text} **Translated from:** \`${res.from.language.iso}\``);
            }).catch(err => {
                return r(message.channel, message.author, `There was an error translating: ${err}`);
            });
        }
    }
}