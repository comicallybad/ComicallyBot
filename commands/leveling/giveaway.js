const { del, awaitReaction } = require("../../functions.js");
const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");
const { addXP } = require("../../dbFunctions.js");

module.exports = {
    name: "giveaway",
    aliases: ["xpgiveaway"],
    category: "leveling",
    description: "Giveaway for xp.",
    permissions: "moderator",
    usage: "<amount> <time>",
    run: async (client, message, args) => {
        const logChannel = message.guild.channels.cache.find(c => c.name === "mod-logs") || message.channel;

        if (!args[0])
            return message.reply("Please provide an amount of xp.").then(m => del(m, 7500));

        if (!args[1])
            return message.reply("Please provide an amount of time.").then(m => del(m, 7500));

        if (isNaN(args[0]))
            return message.reply("Please provide a valid number of xp").then(m => del(m, 7500));

        if (isNaN(args[1]))
            return message.reply("Please provide a valid number for time.").then(m => del(m, 7500));

        let amount = Math.floor(args[0]);
        let time = Math.floor(args[1] * 60000);

        if (amount < 1 || time < 1)
            return message.reply("Please provide numbers greater than or equal to 1.").then(m => del(m, 7500));

        let embed = new MessageEmbed()
            .setTitle("**React below for the giveaway!**")
            .setDescription(`The giveaway is for ${amount} xp, and is going for ${Math.floor(args[1])} minute(s)`)
            .setFooter(`${amount} xp for ${Math.floor(args[1])} minute(s)`, message.author.displayAvatarURL())
            .setTimestamp();

        message.channel.send(embed).then(async msg => {
            const users = await awaitReaction(msg, null, time, "💯");

            if (users.length > 0) {
                const random = Math.floor(Math.random() * users.length);
                let userID = users[random].id;
                let userName = users[random].username;

                msg.reactions.removeAll();

                embed
                    .setDescription(`Congrats <@${userID}>, you are the winner of the ${amount} xp giveaway!`)
                    .setFooter(`${userName} won ${amount} xp!`, message.author.displayAvatarURL());

                addXP(message, userID, amount).then(() => {
                    const logEmbed = new MessageEmbed()
                        .setColor("#0efefe")
                        .setThumbnail(message.author.displayAvatarURL())
                        .setFooter(message.member.displayName, message.author.displayAvatarURL())
                        .setTimestamp()
                        .setDescription(stripIndents`
                                **> XP Giveaway by: <@${message.member.id}> ${message.member.user.username} (${message.member.id})**
                                **> XP Giveaway won by: <@${userID}> (${userID})**
                                **> XP Given: ${amount}**`);

                    logChannel.send(logEmbed);

                    msg.edit(embed);
                });
            } else {
                msg.reactions.removeAll();

                embed
                    .setDescription(`There were no winners awarded, not enough reactions!`)
                    .setFooter(`No one won the ${amount} XP!`, message.author.displayAvatarURL());

                msg.edit(embed);
            }
        });
    }
}