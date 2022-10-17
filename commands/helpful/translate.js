const { s, r, del } = require("../../functions.js");
const translate = require('@vitalets/google-translate-api');

module.exports = {
    name: "translate",
    category: "helpful",
    description: "Translates a message for you.",
    permissions: "member",
    usage: "<message to translate>",
    run: async (client, message, args) => {
        if (!args[0])
            return r(message.channel, message.author, "Please provide something to translate.").then(m => del(m, 7500));

        return await translate(`${args.join(' ')}`, { to: 'en' }).then(res => {
            return s(message.channel, `**Translation:** ${res.text} **Translated from:** \`${res.from.language.iso}\``);
        }).catch(err => s(message.channel, `There was an error translating: ${err}`));
    }
}