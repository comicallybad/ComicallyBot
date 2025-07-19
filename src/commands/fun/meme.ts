import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from "discord.js";
import { RedditResponse, RedditChild, MemeData } from "../../types/reddit";
import { sendReply, deleteReply } from "../../utils/replyUtils";
import { ValidationError } from "../../utils/customErrors";
import fetch from "node-fetch";

export default {
    data: new SlashCommandBuilder()
        .setName("meme")
        .setDescription("Get a random meme."),
    async execute(interaction: ChatInputCommandInteraction) {
        const subReddits = ["meme", "PrequelMemes", "EdgelordMemes", "ProgrammerHumor"];
        const random = subReddits[Math.floor(Math.random() * subReddits.length)];

        const response = await fetch(`https://www.reddit.com/r/${random}/hot/.json?count=100`);
        const json = await response.json() as RedditResponse;

        if (!json || !json.data || !json.data.children || !Array.isArray(json.data.children)) {
            throw new ValidationError("Could not fetch memes from Reddit.");
        }

        const postsWithImages = json.data.children.filter((post: RedditChild) => {
            return post.data.url && (post.data.url.endsWith(".jpg") || post.data.url.endsWith(".png") || post.data.url.endsWith(".gif"));
        });

        if (postsWithImages.length === 0) {
            throw new ValidationError("No image posts found in this subreddit.");
        }

        const randomPost = postsWithImages[Math.floor(Math.random() * postsWithImages.length)];

        const meme: MemeData = {
            image: randomPost.data.url,
            category: randomPost.data.link_flair_text,
            caption: randomPost.data.title,
            permalink: randomPost.data.permalink
        };

        const embed = new EmbedBuilder()
            .setColor("#0efefe")
            .setImage(meme.image)
            .setTitle(`Meme From r/${random}`)
            .setURL(`https://reddit.com${meme.permalink}`)
            .setFooter({ text: meme.caption });

        await sendReply(interaction, { embeds: [embed] });
        await deleteReply(interaction, { timeout: 30000 });
    }
};