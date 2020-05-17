const { MessageEmbed } = require("discord.js");
const humanizeDuration = require('humanize-duration');
const xp = require('../../schemas/xp.js');
const mongoose = require("mongoose");

module.exports = async (client, data) => {
    activities = [`${client.guilds.cache.size} servers!`, `${client.channels.cache.size} channels!`, `${client.users.cache.size} users!`], i = 0;
    let guildID = data.guild.id;
    let guildName = data.guild.name;
    let userID = data.user.id;
    let userName = data.user.username;


    if (data.guild.channels) {
        let logChannel = await data.guild.channels.cache.find(c => c.name === "mod-logs" || undefined);
        if (logChannel) {
            let currentDate = new Date();
            let userJoinDate = data.user.createdAt;
            let time = currentDate - userJoinDate
            let accountTime = humanizeDuration(currentDate - userJoinDate)
            const embed = new MessageEmbed()
                .setColor("#0efefe")
                .setTitle("User Joined")
                .setThumbnail(data.user.displayAvatarURL())
                .setDescription(`${data.user} ${data.user.tag}`)
                .setFooter(`ID: ${data.user.id}`)
                .setTimestamp()

            if (time <= 604800000) { //604800000  is 7 days in MS
                embed.addField("**Warning** new user account:", `Account created ${accountTime} ago.`);
                logChannel.send(embed);
            } else {
                logChannel.send(embed);
            }
        }
    }

    xp.findOne({ guildID: guildID, userID: userID }, (err, exists) => {
        if (!exists) {
            const newXP = new xp({
                _id: mongoose.Types.ObjectId(),
                guildID: guildID, guildName: guildName,
                userID: userID, userName: userName, xp: 0, level: 0
            })
            newXP.save().catch(err => console.log(err));
        }
    });
}