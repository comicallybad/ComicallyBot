const { s, del } = require("../../functions.js");
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
            else
                return message.reply(`${10 * Math.pow(args[0], 3) / 5 + 25} XP is required for level ${args[0]}`).then(m => del(m, 7500));
        } else {
            for (let i = 0; i < 10; i++) {
                let XP = 10 * Math.pow(i + 1, 3) / 5 + 25;
                embed.addField(`XP for level ${i + 1}`, `${XP} XP`)
            }
            return s(message.channel, '', embed).then(m => del(m, 30000));
        }
    }
}
