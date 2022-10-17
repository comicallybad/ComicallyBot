const { s, r } = require("../../functions.js");
const { MessageEmbed } = require("discord.js");
const randomPuppy = require("random-puppy");

module.exports = {
    name: "meme",
    category: "fun",
    description: "Get a random meme.",
    permissions: "member",
    run: async (client, message, args) => {
        try {
            const subReddits = ["dankmeme", "meme", "PrequelMemes", "EdgelordMemes", "ProgrammerHumor"];
            const random = subReddits[Math.floor(Math.random() * subReddits.length)];

            const img = await randomPuppy(random)
            while (img == undefined) await randomPuppy(random);

            const embed = new MessageEmbed()
                .setColor("#0efefe")
                .setImage(img)
                .setTitle(`From /r/${random}`)
                .setURL(`https://reddit.com/r/${random}`)
                .setTimestamp();

            return s(message.channel, '', embed);
        } catch (err) {
            return r(message.channel, message.author, `There was an error attempting to find a new meme: ${err}`);
        }
    }
}