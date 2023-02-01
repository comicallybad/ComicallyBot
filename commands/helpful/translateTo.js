const { s, r, del } = require("../../functions.js");
const { translate } = require('@vitalets/google-translate-api');

module.exports = {
    name: "translateto",
    category: "helpful",
    description: "Translates a message to a specified language for you.",
    permissions: "member",
    usage: "<language code> <message to translate>",
    run: async (client, message, args) => {
        if (!args[0])
            return r(message.channel, message.author, "Please provide a language code Ex: 'en' for english 'es' for spanish.").then(m => del(m, 7500));

        let translateToLanguage = args[0];
        return translate(`${args.splice(1).join(' ')}`, { to: translateToLanguage }).then(res => {
            return s(message.channel, `**Translation:** ${res.text} **Translated from:** \`${res.raw.src}\``);
        }).catch(err => s(message.channel, `There was an error translating: ${err}`));
    }
}