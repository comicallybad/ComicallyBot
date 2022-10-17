const { s, r, del, findID } = require("../../functions.js");
const { stripIndents } = require("common-tags");
const { MessageEmbed } = require("discord.js");
const { addXP } = require("../../dbFunctions");

module.exports = {
    name: "addxp",
    aliases: ["xpadd"],
    category: "leveling",
    description: "Add XP to user.",
    permissions: "moderator",
    usage: "<@user|userID> <amount>",
    run: async (client, message, args) => {
        const logChannel = message.guild.channels.cache.find(c => c.name.includes("mod-logs")) || message.channel;

        if (!args[0])
            return r(message.channel, message.author, "Please provide a user.").then(m => del(m, 7500));

        if (!args[1])
            return r(message.channel, message.author, "Please provide amount of XP.").then(m => del(m, 7500));

        if (isNaN(args[1]) || parseInt(args[1]) <= 0)
            return r(message.channel, message.author, "Please provide a valid amount above 0.").then(m => del(m, 7500));

        if (parseInt(args[1]) > 10000)
            return r(message.channel, message.author, "You may not add more than 10,000 XP to a user").then(m => del(m, 7500));

        let ID = await findID(message, args[0]);
        let xpToAdd = Math.floor(parseInt(args[1]));

        if (!ID) return r(message.channel, message.author, "User not found.").then(m => del(m, 7500));
        else addXP(message, ID, xpToAdd).then(() => {
            const embed = new MessageEmbed()
                .setColor("#00ff00")
                .setTitle("XP Added")
                .setThumbnail(message.author.displayAvatarURL())
                .setFooter({ text: message.member.displayName, iconURL: message.author.displayAvatarURL() })
                .setTimestamp()
                .setDescription(stripIndents`
                **XP Added By:** ${message.member.user}
                **XP Given To:** <@${ID}> (${ID})
                **XP Given:** ${xpToAdd}`);

            s(logChannel, '', embed);

            return s(message.channel, xpToAdd + " XP was added to the user.").then(m => del(m, 7500));
        }).catch(err => err);
    }
}