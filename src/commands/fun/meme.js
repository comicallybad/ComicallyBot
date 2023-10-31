const { s, r, del } = require("../../../utils/functions/functions.js");
const { EmbedBuilder } = require("discord.js");
const fetch = require("node-fetch");

module.exports = {
    name: "meme",
    category: "fun",
    description: "Get a random meme.",
    permissions: "member",
    run: async (client, message, args) => {
        try {
            const subReddits = ["dankmeme", "meme", "PrequelMemes", "EdgelordMemes", "ProgrammerHumor"];
            const random = subReddits[Math.floor(Math.random() * subReddits.length)];

            await fetch("https://www.reddit.com/r/" + random + "/hot/.json?count=100").then(res => res.json()).then(json => {
                let postID = json.data.children[Math.floor(Math.random() * json.data.children.length)];
                meme = {
                    image: postID.data.url,
                    category: postID.data.link_flair_text,
                    caption: postID.data.title,
                    permalink: postID.data.permalink
                };
            });

            const embed = new EmbedBuilder()
                .setColor("#0efefe")
                .setImage(meme.image)
                .setTitle(`Meme From r/${random}`)
                .setURL(`https://reddit.com/r/${random}`)
                .setFooter({ text: meme.caption });

            return s(message.channel, '', embed);
        } catch (err) {
            return r(message.channel, message.author, `There was an error attempting to find a new meme: ${err}`).then(m => del(m, 7500));
        }
    }
}