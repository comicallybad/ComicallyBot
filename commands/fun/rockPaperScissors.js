const { s, e, promptMessage } = require("../../functions.js");
const { MessageEmbed } = require("discord.js");

const chooseArr = ["🗻", "📰", "✂"];

module.exports = {
    name: "rockpaperscissors",
    aliases: ["rps"],
    category: "fun",
    description: "Rock Paper Scissors game. React to one of the emojis to play the game.",
    permissions: "member",
    run: async (client, message, args) => {
        const embed = new MessageEmbed()
            .setColor("#ffffff")
            .setFooter({ text: message.guild.me.displayName, iconURL: client.user.displayAvatarURL() })
            .setDescription("Add a reaction to one of these emojis to play the game!")
            .setTimestamp();

        const m = await s(message.channel, '', embed);
        const reacted = await promptMessage(m, message.author, 30, chooseArr);

        const botChoice = chooseArr[Math.floor(Math.random() * chooseArr.length)];

        const result = await getResult(reacted, botChoice);
        await m.reactions.removeAll().catch(err => err);

        embed
            .setDescription("")
            .addField(result, `${reacted} vs ${botChoice}`);

        e(m, m.channel, '', embed);
        function getResult(me, clientChosen) {
            if ((me === "🗻" && clientChosen === "✂") ||
                (me === "📰" && clientChosen === "🗻") ||
                (me === "✂" && clientChosen === "📰")) {
                return "You won!";
            } else if (me === clientChosen) {
                return "It's a tie!";
            } else {
                return "You lost!";
            }
        }
    }
}