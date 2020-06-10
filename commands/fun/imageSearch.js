const { del, promptMessage } = require("../../functions.js");
var gis = require('g-i-s');


module.exports = {
    name: "imagesearch",
    aliases: ["image", "picsearch", "pic"],
    category: "fun",
    description: "Searches for a google image.",
    permissions: "member",
    usage: "<image | description for search>",
    run: async (client, message, args) => {
        if (!args[0])
            return message.reply("Please provide an image to search for.").then(m => del(m, 7500));

        gis(args.join(' '), logResults);

        function logResults(error, results) {
            if (error) {
                return message.reply("Could not find any images.").then(m => del(m, 7500))
            }
            else {
                const num = Math.floor(Math.random() * results.length) + 1;
                message.channel.send(results[num].url).then(async m => {
                    const emoji = await promptMessage(m, message.author, 15, ["➡️", "🗑️"]);
                    if (emoji === "➡️") {
                        m.reactions.removeAll().then(() => {
                            nextPicture(m, message.author, results);
                        });
                    } else if (emoji === "🗑️") {
                        del(m, 0)
                    } else {
                        del(m, 0)
                    }
                })
            }
        }
    }
}

async function nextPicture(message, author, results) {
    const num = Math.floor(Math.random() * results.length) + 1;
    message.edit(results[num].url).then(async m => {
        const emoji = await promptMessage(m, author, 15, ["➡️", "🗑️"]);
        if (emoji === "➡️") {
            m.reactions.removeAll().then(() => {
                nextPicture(m, author, results);
            });
        } else if (emoji === "🗑️") {
            del(m, 0)
        } else {
            del(m, 0)
        }
    })
}