const { del } = require("../../functions.js");
var gis = require('g-i-s');


module.exports = {
    name: "imagesearch",
    aliases: ["image", "picsearch", "pic"],
    category: "fun",
    description: "Searches for a google image.",
    permissions: "member",
    run: (client, message, args) => {
        if (!args[0])
            return message.reply("Please provide an image to search for.").then(m => del(m, 7500));

        gis(args.join(' '), logResults);

        function logResults(error, results) {
            if (error) {
                return message.reply("Could not find any images.").then(m => del(m, 7500))
            }
            else {
                const num = Math.floor(Math.random() * results.length) + 1;
                return message.reply(results[num].url).then(m => del(m, 30000))
            }
        }
    }
}