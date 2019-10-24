const { promptMessage, getCommandStatus, hasPermissions } = require("../../functions.js");
const { RichEmbed } = require("discord.js");

const chooseArr = ["🗻", "📰", "✂"];

module.exports = {
    name: "rps",
    aliases: ["rockpaperscissors"],
    category: "fun",
    description: "Rock Paper Scissors game. React to one of the emojis to play the game.",
    permissions: "member",
    run: (client, message, args) => {
        getCommandStatus(message, "rps").then(function (res) {
            if (!res) message.reply("Command disabled").then(m => m.delete(7500));
            if (res) {
                hasPermissions(message, "member").then(async function (res) {
                    if (!res) message.reply("You do not have permissions for this command.").then(m => m.delete(7500))
                    if (res) {
                        const embed = new RichEmbed()
                            .setColor("#ffffff")
                            .setFooter(message.guild.me.displayName, client.user.displayAvatarURL)
                            .setDescription("Add a reaction to one of these emojis to play the game!")
                            .setTimestamp();

                        const m = await message.channel.send(embed);
                        const reacted = await promptMessage(m, message.author, 30, chooseArr);

                        const botChoice = chooseArr[Math.floor(Math.random() * chooseArr.length)];

                        const result = await getResult(reacted, botChoice);
                        await m.clearReactions();

                        embed
                            .setDescription("")
                            .addField(result, `${reacted} vs ${botChoice}`);

                        m.edit(embed);

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
                })
            }
        })
    }
}