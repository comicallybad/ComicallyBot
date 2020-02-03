const { RichEmbed } = require("discord.js");
const randomPuppy = require("random-puppy");

module.exports = {
    name: "meme",
    aliases: ["memes", "plsmeme"],
    category: "fun",
    description: "Get a random meme.",
    permissions: "member",
    run: async (client, message, args) => {
        const subReddits = ["dankmeme", "meme", "PrequelMemes", "EdgelordMemes", "ImGoingToHellForThis", "ProgrammerHumor"];
        const random = subReddits[Math.floor(Math.random() * subReddits.length)];

        const img = await randomPuppy(random)
        const embed = new RichEmbed()
            .setColor("#0efefe")
            .setImage(img)
            .setTitle(`From /r/${random}`)
            .setURL(`https://reddit.com/r/${random}`)
            .setTimestamp();

        if (message.deletable) message.delete();
        message.channel.send(embed)
    }
}