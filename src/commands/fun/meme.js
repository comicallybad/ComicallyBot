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
        try {
            const response = await fetch(`https://www.reddit.com/r/${random}/hot/.json?count=100`);
            const json = await response.json();

            if (!json || !json.data || !json.data.children || !Array.isArray(json.data.children)) return;

            const postsWithImages = json.data.children.filter(post => {
                return post.data.url && (post.data.url.endsWith('.jpg') || post.data.url.endsWith('.png') || post.data.url.endsWith('.gif'));
            });

            if (postsWithImages.length === 0) return;

            const randomPost = postsWithImages[Math.floor(Math.random() * postsWithImages.length)];

            meme = {
                image: randomPost.data.url,
                category: randomPost.data.link_flair_text,
                caption: randomPost.data.title,
                permalink: randomPost.data.permalink
            };
        } catch (err) {
            return re(interaction, "There was an error getting a meme from Reddit. Please retry.").then(() => delr(interaction, 7500));
        }

        if (!meme) return;

        const embed = new EmbedBuilder()
            .setColor("#0efefe")
            .setImage(meme.image)
            .setTitle(`Meme From r/${random}`)
            .setURL(`https://reddit.com${meme.permalink}`)
            .setFooter({ text: meme.caption });

        return r(interaction, "", embed);
    }
};