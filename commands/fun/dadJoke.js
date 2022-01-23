const { s, del } = require("../../functions.js");
const { MessageEmbed } = require("discord.js");
const dadJokes = require('@mikemcbride/dad-jokes');

module.exports = {
    name: "dadjoke",
    category: "fun",
    description: "Says a random dad joke.",
    permissions: "member",
    run: (client, message, args) => {
        let embed = new MessageEmbed()
            .setColor("#0efefe")
            .setTitle("Here's a good one...")
            .setTimestamp()
            .setDescription(`${dadJokes.random()}`);

        return s(message.channel, '', embed).then(m => del(m, 30000));
    }
}