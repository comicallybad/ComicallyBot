const { s, del } = require("../../functions.js");
const { MessageEmbed } = require("discord.js");
const db = require('../../schemas/db.js');

module.exports = {
    name: "addsuggestion",
    aliases: ["suggest"],
    category: "suggestion",
    description: "Sends a message with a suggestion users can vote on.",
    permissions: "member",
    usage: "<suggestion>",
    run: (client, message, args) => {
        let guildID = message.guild.id;

        db.findOne({ guildID: guildID, channels: { $elemMatch: { command: "suggest" } } }, async (err, exists) => {
            if (!exists) return message.reply("A suggestion channel has not been set by a moderator.").then(m => del(m, 7500));
            if (exists) {
                let channel = message.guild.channels.cache.get(exists.channels.filter(cmd => cmd.command == "suggest")[0].channelID);

                if (message.channel.id !== channel.id)
                    return message.reply(`This command is only available in the ${channel} channel.`).then(m => del(m, 7500));

                if (!args[0])
                    return message.reply("Please provide a suggestion.").then(m => del(m, 7500));

                let suggestion = args.join(" ");

                if (suggestion.length >= 1024)
                    return message.reply("You can only use a string less than 2048 characters!").then(m => del(m, 7500));
                else {
                    const embed = new MessageEmbed()
                        .setColor("#0efefe")
                        .setAuthor(`${message.member.user.tag}`, `${message.author.displayAvatarURL()}`)
                        .setDescription(suggestion)
                        .setFooter(`Select a reaction below to vote on ${message.author.username}'s suggestion`)
                        .setTimestamp()

                    if (args[0]) {
                        let m = await s(message.channel, '', embed);
                        return m.react("✅").then(m.react("❌"));
                    }
                }
            }
        }).catch(err => err);
    }
}