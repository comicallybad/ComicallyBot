const { s, del } = require("../../functions.js");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "coinflip",
    aliases: ["flip"],
    category: "fun",
    description: "Flips a coin for heads or tails.",
    permissions: "member",
    run: (client, message, args) => {
        let embed = new MessageEmbed()
            .setColor("#0efefe")
            .setTitle("A coin was flipped..")
            .setTimestamp()

        let number = Math.floor(Math.random() * 2);

        if (number === 0) embed.addFields({ name: "Result", value: "\`Heads\`" });
        else embed.addFields({ name: "Result", value: "\`Tails\`" });

        return s(message.channel, '', embed).then(m => del(m, 30000));
    }
}