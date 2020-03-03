const { MessageEmbed } = require("discord.js");
const randomPuppy = require("random-puppy");

module.exports = {
    name: "meme",
    aliases: ["memes", "plsmeme"],
    category: "fun",
    description: "Get a random meme.",
    permissions: "member",
    run: async (client, message, args) => {
        const subReddits = ["dankmeme", "meme", "PrequelMemes", "EdgelordMemes", "ProgrammerHumor"];
        const random = subReddits[Math.floor(Math.random() * subReddits.length)];

        const img = await randomPuppy(random)
        const embed = new MessageEmbed()
            .setColor("#0efefe")
            .setImage(img)
            .setTitle(`From /r/${random}`)
            .setURL(`https://reddit.com/r/${random}`)
            .setTimestamp();

        message.channel.send(embed);
    }
}