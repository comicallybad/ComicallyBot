const { s, r, e, del, collectReactors } = require("../../../utils/functions/functions.js");
const { EmbedBuilder } = require("discord.js");
const { stripIndents } = require("common-tags");
const { addXP } = require("../../../utils/functions/dbFunctions.js");

module.exports = {
    name: "giveaway",
    aliases: ["xpgiveaway"],
    category: "leveling",
    description: "Giveaway for xp.",
    permissions: "moderator",
    usage: "<amount> <time>",
    run: async (client, message, args) => {
        const logChannel = message.guild.channels.cache.find(c => c.name.includes("mod-logs")) || message.channel;

        if (!args[0])
            return r(message.channel, message.author, "Please provide an amount of xp.").then(m => del(m, 7500));

        if (!args[1])
            return r(message.channel, message.author, "Please provide an amount of time.").then(m => del(m, 7500));

        if (isNaN(args[0]))
            return r(message.channel, message.author, "Please provide a valid number of xp").then(m => del(m, 7500));

        if (isNaN(args[1]))
            return r(message.channel, message.author, "Please provide a valid number for time.").then(m => del(m, 7500));

        let amount = Math.floor(args[0]);
        let time = Math.floor(args[1] * 60000);

        if (amount < 1 || time < 1)
            return r(message.channel, message.author, "Please provide numbers greater than or equal to 1.").then(m => del(m, 7500));

        let embed = new EmbedBuilder()
            .setTitle("**React below for the giveaway!**")
            .setDescription(`The giveaway is for ${amount} xp, and is going for ${Math.floor(args[1])} minute(s)`)
            .setFooter({ text: `${amount} xp for ${Math.floor(args[1])} minute(s)`, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();

        return s(message.channel, '', embed).then(async msg => {
            const users = await collectReactors(msg, null, time, "💯");

            if (users.length > 0) {
                const random = Math.floor(Math.random() * users.length);
                let userID = users[random].id;
                let userName = users[random].username;
                let user = await message.guild.members.fetch(users[random].id);
                let avatar = user.user.displayAvatarURL();

                msg.reactions.removeAll().catch(err => err);

                embed
                    .setDescription(`Congrats <@${userID}>, you are the winner of the ${amount} xp giveaway!`)
                    .setThumbnail(avatar)
                    .setFooter({ text: `${userName} won ${amount} xp!`, iconURL: avatar });

                addXP(message, userID, amount).then(() => {
                    const logEmbed = new EmbedBuilder()
                        .setColor("#00ff00")
                        .setThumbnail(message.author.displayAvatarURL())
                        .setFooter({ text: message.member.displayName, iconURL: message.author.displayAvatarURL() })
                        .setTimestamp()
                        .setDescription(stripIndents`
                        **XP Giveaway By:** <@${message.member.id}> ${message.member.user.username} (${message.member.id})
                        **XP Giveaway Won By:** <@${userID}> (${userID})
                        **XP Given:** ${amount}`);

                    s(logChannel, '', logEmbed);

                    return e(msg, message.channel, '', embed);
                }).catch(err => err);
            } else {
                msg.reactions.removeAll().catch(err => err);

                embed
                    .setDescription(`There were no winners awarded, not enough reactions!`)
                    .setFooter({ text: `No one won the ${amount} XP!`, iconURL: message.author.displayAvatarURL() });

                return e(msg, msg.channel, '', embed);
            }
        }).catch(err => err);
    }
}