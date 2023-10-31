const { s, r, e, del, messagePrompt } = require("../../../utils/functions/functions.js");
const gis = require('async-g-i-s');

module.exports = {
    name: "imagesearch",
    aliases: ["image", "pic"],
    category: "fun",
    description: "Searches for a google image.",
    permissions: "member",
    usage: "<image | description for search>",
    run: async (client, message, args) => {
        if (!args[0])
            return r(message.channel, message.author, "Please provide an image to search for.").then(m => del(m, 7500));

        (async () => {
            try {
                const results = await gis(args.join(' '));
                s(message.channel, "Image: ").then(m => {
                    return nextPicture(m, message.author, results)
                }).catch(err => err);
            } catch (err) {
                return s(message.channel, "There was an error finding an image").then(m => del(m, 7500));
            }
        })();
    }
}

async function nextPicture(message, author, results) {
    const num = Math.floor(Math.random() * results.length);
    if (!results[num]) return r(message.channel, message.author, "Sorry there was an error with that search, try again.").then(m => del(m, 7500));
    e(message, message.channel, `${results[num].url}`).then(async m => {
        const emoji = await messagePrompt(m, author, 15, ["➡️", "🗑️", "❤️"]);
        if (emoji === "➡️") {
            m.reactions.removeAll().then(() => {
                return nextPicture(m, author, results);
            }).catch(err => err);
        } else if (emoji === "🗑️") return del(m, 0)
        else if (emoji === "❤️") return m.reactions.removeAll().catch(err => err);
        else return del(m, 0)
    }).catch(err => err);
}