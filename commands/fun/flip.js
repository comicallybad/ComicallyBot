const { RichEmbed } = require("discord.js");

module.exports = {
    name: "flip",
    aliases: ["coinflip", "coin", "heardsortails"],
    category: "fun",
    description: "Flips a coin for heads or tails.",
    permissions: "member",
    run: (client, message, args) => {
        if (message.deletable) message.delete();

        let embed = new RichEmbed()
            .setColor("#0efefe")
            .setTitle("A coin was flipped..")
            .setTimestamp()

        let number = Math.floor(Math.random() * 2);

        if (number === 0) embed.addField("Result", "\`Heads\`")
        else embed.addField("Result", "\`Tails\`")

        message.channel.send(embed);
    }
}