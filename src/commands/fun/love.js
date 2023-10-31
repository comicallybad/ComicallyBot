const { s } = require("../../../utils/functions/functions.js");
const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "love",
    category: "fun",
    description: "Calculates the love affinity you have for another person.",
    permissions: "member",
    usage: "[@user | userID | username]",
    run: async (client, message, args) => {
        let person;
        if (args[0])
            person = message.mentions.members.first() || await message.guild.members.fetch(args[0]).catch(err => { return; });

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

        const embed = new EmbedBuilder()
            .setColor("#ffb6c1")
            .addFields({
                name: `☁ **${person.displayName}** loves **${message.member.displayName}** this much:`,
                value: `💟 ${Math.floor(love)}%\n\n${loveLevel}`
            }).setTimestamp();

        return s(message.channel, '', embed);
    }
}