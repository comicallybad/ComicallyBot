const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "love",
    aliases: ["feels", "vibes"],
    category: "fun",
    description: "Calculates the love affinity you have for another person.",
    permissions: "member",
    usage: "[@user | userID | username]",
    run: async (client, message, args) => {
        let person;
        if (args[0])
            person = message.mentions.members.first() || await message.guild.members.fetch(args[0]);

        if (!person || message.author.id === person.id) {
            const allMembers = [
                ...(
                    (await message.guild.members.fetch())
                        .filter(m => m.id !== message.author.id)
                ).values()
            ]
            person = await allMembers[Math.floor(Math.random() * allMembers.length)]
        }

        const love = Math.random() * 100;
        const loveIndex = Math.floor(love / 10);
        const loveLevel = "💖".repeat(loveIndex) + "💔".repeat(10 - loveIndex);

        const embed = new MessageEmbed()
            .setColor("#ffb6c1")
            .addField(`☁ **${person.displayName}** loves **${message.member.displayName}** this much:`,
                `💟 ${Math.floor(love)}%\n\n${loveLevel}`).setTimestamp();

        message.channel.send(embed);
    }
}