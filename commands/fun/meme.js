const { s, r, del } = require("../../functions.js");
const memes = require("random-memes");

module.exports = {
    name: "meme",
    category: "fun",
    description: "Get a random meme.",
    permissions: "member",
    run: async (client, message, args) => {
        try {
            let meme = await memes.fromReddit("en");
            return s(message.channel, meme.image);
        } catch (err) {
            return r(message.channel, message.author, `There was an error attempting to find a new meme: ${err}`).then(m => del(m, 7500));
        }
    }
}