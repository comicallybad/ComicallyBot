const { del } = require("../../functions.js");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "levels",
    aliases: ["xpforlevel", "levelxp", "level"],
    category: "leveling",
    description: "Shows XP required for levels.",
    permissions: "member",
    usage: "[level]",
    run: (client, message, args) => {
        const embed = new MessageEmbed()
            .setTitle("XP Levels")
            .setColor("#0efefe")
            .setTimestamp()

        if (args[0]) {
            if (isNaN(args[0]))
                return message.reply("Please provide a valid level.").then(m => del(m, 7500));
            else if (args[0] == 0)
                return message.reply("You are defaulted to level 0, no XP is required for this level.").then(m => del(m, 7500));
            else if (args[0] == 1)
                return message.reply(`XP required for level 1 is 10 XP`).then(m => del(m, 7500));
            else if (args[0] > 1)
                return message.reply(`${10 * Math.pow(args[0], 3) / 5} XP is required for level ${args[0]}`).then(m => del(m, 7500));
        } else {
            for (let i = 0; i < 10; i++) {
                if (i == 0) embed.addField(`XP for level ${i + 1}`, `10 XP`)
                else embed.addField(`XP for level ${i + 1}`, `${10 * Math.pow(i + 1, 3) / 5}XP`)
            }
            message.channel.send(embed).then(m => del(m, 30000));
        }
    }
}
