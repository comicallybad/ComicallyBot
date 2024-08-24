const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { r, re, delr } = require("../../../utils/functions/functions.js");
const fetch = require('node-fetch');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('meme')
        .setDescription('Get a random meme.'),
    execute: async (interaction) => {
        const subReddits = ["dankmeme", "meme", "PrequelMemes", "EdgelordMemes", "ProgrammerHumor"];
        const random = subReddits[Math.floor(Math.random() * subReddits.length)];

        let meme;
        await fetch("https://www.reddit.com/r/" + random + "/hot/.json?count=100").then(res => res.json()).then(json => {
            let postID = json.data.children[Math.floor(Math.random() * json.data.children.length)];
            meme = {
                image: postID.data.url,
                category: postID.data.link_flair_text,
                caption: postID.data.title,
                permalink: postID.data.permalink
            };
        }).catch(err => re(interaction, "There was an error getting a meme from Reddit.").then(() => delr(interaction, 7500)));

        const embed = new EmbedBuilder()
            .setColor("#0efefe")
            .setImage(meme.image)
            .setTitle(`Meme From r/${random}`)
            .setURL(`https://reddit.com${meme.permalink}`)
            .setFooter({ text: meme.caption });

        return r(interaction, "", embed);
    }
}