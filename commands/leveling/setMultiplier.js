const { s, r, del } = require("../../functions.js");
const db = require('../../schemas/db.js');
const { stripIndents } = require("common-tags");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "setmultiplier",
    aliases: ["multiplierset", "setxpmultiplier", "setxpmult"],
    category: "leveling",
    description: "Set XP multiplier.",
    permissions: "moderator",
    usage: "<number 1-3>",
    run: (client, message, args) => {
        const logChannel = message.guild.channels.cache.find(c => c.name.includes("mod-logs")) || message.channel;

        let guildID = message.guild.id;

        if (!args[0])
            return r(message.channel, message.author, "Please provide a multiplier.").then(m => del(m, 7500));

        if (isNaN(args[0]) || parseInt(args[0]) <= 0)
            return r(message.channel, message.author, "Please provide a valid amount above 0.").then(m => del(m, 7500));

        if (!isNaN(args[0]))
            if (args[0] > 3) return r(message.channel, message.author, "Please provide an amount between 1 and 3").then(m => del(m, 7500));
            else {
                db.updateOne({ guildID: guildID }, {
                    xpMultiplier: args[0]
                }).catch(err => console.log(err))

                const embed = new MessageEmbed()
                    .setColor("#0efefe")
                    .setTitle("XP Multiplier Set")
                    .setThumbnail(message.author.displayAvatarURL())
                    .setFooter({ text: message.member.displayName, iconURL: message.author.displayAvatarURL() })
                    .setTimestamp()
                    .setDescription(stripIndents`
                    **Multiplier Set by:** ${message.member.user}
                    **Multiplier Set to:** ${args[0]}`);

                s(logChannel, '', embed);

                return r(message.channel, message.author, "Server multiplier set to: " + args[0] + "x XP").then(m => del(m, 7500));
            }
    }
}