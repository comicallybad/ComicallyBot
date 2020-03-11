const db = require('../../schemas/db.js');

const { stripIndents } = require("common-tags");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "setmultiplier",
    aliases: ["multiplierset", "setcoinsmultiplier", "coinssetmultiplier"],
    category: "coins",
    description: "Get number of coins.",
    permissions: "moderator",
    usage: "<number 1-3>",
    run: (client, message, args) => {
        const logChannel = message.guild.channels.cache.find(c => c.name === "mods-log") || message.channel;

        let guildID = message.guild.id;

        if (!args[0])
            return message.reply("Please provide a multiplier.").then(m => m.delete({ timeout: 7500 }));

        if (isNaN(args[0]) || parseInt(args[0]) <= 0)
            return message.reply("Please provide a valid amount above 0.").then(m => m.delete({ timeout: 7500 }));

        if (!isNaN(args[0]))
            if (args[0] > 3) return message.reply("Please provide an amount between 1 and 3").then(m => m.delete({ timeout: 7500 }));
            else {
                db.updateOne({ guildID: guildID }, {
                    coinsMultiplier: args[0]
                }).catch(err => console.log(err))

                const embed = new MessageEmbed()
                    .setColor("#0efefe")
                    .setThumbnail(message.author.displayAvatarURL())
                    .setFooter(message.member.displayName, message.author.displayAvatarURL())
                    .setTimestamp()
                    .setDescription(stripIndents`
                    **> Multiplier Set by:** <${message.member.id}> ${message.member.user.username} (${message.member.id})
                    **> Multiplier Set to:** ${args[0]}`);

                logChannel.send(embed);

                return message.reply("Server multiplier set to: " + args[0] + "x coins").then(m => m.delete({ timeout: 7500 }));
            }
    }
}