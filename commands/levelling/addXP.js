const { del, findID } = require("../../functions.js");
const { stripIndents } = require("common-tags");
const { MessageEmbed } = require("discord.js");
const { addXP } = require("../../dbFunctions");

module.exports = {
    name: "addxp",
    aliases: ["xpadd"],
    category: "levelling",
    description: "Add XP to user.",
    permissions: "moderator",
    usage: "<@user|userID> <amount>",
    run: (client, message, args) => {
        const logChannel = message.guild.channels.cache.find(c => c.name === "mod-logs") || message.channel;

        if (!args[0])
            return message.reply("Please provide a user.").then(m => del(m, 7500));

        if (!args[1])
            return message.reply("Please provide amount of XP.").then(m => del(m, 7500));

        if (isNaN(args[1]) || parseInt(args[1]) <= 0)
            return message.reply("Please provide a valid amount above 0.").then(m => del(m, 7500));

        let ID = findID(message, args[0], "user");
        let xpToAdd = Math.floor(parseInt(args[1]));


        if (!ID) return message.reply("User not found.").then(m => del(m, 7500));
        else addXP(message, ID, Math.floor(parseInt(args[1]))).then(() => {
            const embed = new MessageEmbed()
                .setColor("#0efefe")
                .setThumbnail(message.author.displayAvatarURL())
                .setFooter(message.member.displayName, message.author.displayAvatarURL())
                .setTimestamp()
                .setDescription(stripIndents`
                **> XP Added by: ${message.member.user}**
                **> XP Given to: <@${ID}> (${ID})**
                **> XP Given: ${xpToAdd}**`);

            logChannel.send(embed);

            return message.reply(xpToAdd + " XP was added to the user.").then(m => del(m, 7500));
        })
    }
}