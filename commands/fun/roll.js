const { RichEmbed } = require("discord.js");

module.exports = {
    name: "roll",
    aliases: ["dice", "diceroll", "rolldice"],
    category: "fun",
    description: "Rolls a dice for a number 1-6.",
    permissions: "member",
    run: (client, message, args) => {
        let embed = new RichEmbed()
            .setColor("#0efefe")
            .setTitle("A dice was rolled..")
            .setTimestamp()

        let number = Math.floor(Math.random() * 6 + 1);

        embed.addField("Result", `\`${number}\``);

        message.channel.send(embed);
    }
}