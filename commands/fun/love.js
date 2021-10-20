const { getMember } = require("../../functions.js");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "love",
    aliases: ["feels", "vibes"],
    category: "fun",
    description: "Calculates the love affinity you have for another person.",
    permissions: "member",
    usage: "[@user | userID | username]",
    run: (client, message, args) => {
        let person = getMember(message, args[0]);

        if (!person || message.author.id === person.id) {
            person = message.guild.members.cache
                .filter(m => m.id !== message.author.id)
                .random();
        }

        const love = Math.random() * 100;
        const loveIndex = Math.floor(love / 10);
        const loveLevel = "💖".repeat(loveIndex) + "💔".repeat(10 - loveIndex);

        const embed = new MessageEmbed()
            .setColor("#ffb6c1")
            .addField(`☁ **${person.displayName}** loves **${message.member.displayName}** this much:`,
                `💟 ${Math.floor(love)}%\n\n${loveLevel}`)
            .setTimestamp();

        message.channel.send(embed);
    }
}