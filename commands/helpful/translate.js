const { r, del } = require("../../functions.js");
const translate = require('@vitalets/google-translate-api');

module.exports = {
    name: "translate",
    aliases: ["translation"],
    category: "helpful",
    description: "Translates a message for you.",
    permissions: "member",
    usage: "<message to translate>",
    run: (client, message, args) => {
        if (!args[0])
            return r(message.channel, message.author, "Please provide something to translate.").then(m => del(m, 7500));
        else {
            translate(`${args.join(' ')}`, { to: 'en' }).then(res => {
                return r(message.channel, message.author, `**Translation:** ${res.text} **Translated from:** \`${res.from.language.iso}\``);
            }).catch(err => {
                return r(message.channel, message.author, `There was an error translating: ${err}`);
            });
        }
    }
}