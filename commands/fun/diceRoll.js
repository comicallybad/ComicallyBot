const { s, del } = require("../../functions.js");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "diceroll",
    aliases: ["dice", "roll"],
    category: "fun",
    description: "Rolls a dice for a number 1-6.",
    permissions: "member",
    run: (client, message, args) => {
        let embed = new MessageEmbed()
            .setColor("#0efefe")
            .setTitle("A dice was rolled..")
            .setTimestamp()

        let number = Math.floor(Math.random() * 6);
        let images =
            ["https://upload.wikimedia.org/wikipedia/commons/2/2c/Alea_1.png",
                "https://upload.wikimedia.org/wikipedia/commons/b/b8/Alea_2.png",
                "https://upload.wikimedia.org/wikipedia/commons/2/2f/Alea_3.png",
                "https://upload.wikimedia.org/wikipedia/commons/8/8d/Alea_4.png",
                "https://upload.wikimedia.org/wikipedia/commons/5/55/Alea_5.png",
                "https://upload.wikimedia.org/wikipedia/commons/f/f4/Alea_6.png"]

        embed.setImage(images[number]);

        return s(message.channel, '', embed).then(m => del(m, 15000));
    }
}