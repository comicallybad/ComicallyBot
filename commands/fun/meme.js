const { getCommandStatus, hasPermissions } = require("../../functions.js");
const { RichEmbed } = require("discord.js");
const randomPuppy = require("random-puppy");

module.exports = {
    name: "meme",
    aliases: ["memes", "plsmeme"],
    category: "fun",
    description: "Get a random meme",
    permissions: "member",
    run: (client, message, args) => {
        getCommandStatus(message, "meme").then(function (res) {
            if (!res) message.reply("Command disabled").then(m => m.delete(7500));
            if (res) {
                hasPermissions(message, "member").then(async function (res) {
                    if (!res) message.reply("You do not have permissions for this command.").then(m => m.delete(7500))
                    if (res) {
                        const subReddits = ["dankmeme", "meme", "me_irl"];
                        const random = subReddits[Math.floor(Math.random() * subReddits.length)];

                        const img = await randomPuppy(random)
                        const embed = new RichEmbed()
                            .setColor("#0efefe")
                            .setImage(img)
                            .setTitle(`From /r/${random}`)
                            .setURL(`https://reddit.com/r/${random}`);

                        message.channel.send(embed)
                        if (message.deletable) message.delete();
                    }
                })
            }
        })
    }
}