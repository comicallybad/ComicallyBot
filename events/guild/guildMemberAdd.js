const { reverseFormatDate, formatTime } = require("../../functions.js");
const { MessageEmbed } = require("discord.js");
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
        let currentDate = new Date();
        let date = reverseFormatDate(currentDate).replace(/[^0-9.]/g, '');
        let time = formatTime(currentDate).split(":");
        let userJoinDate = reverseFormatDate(data.user.createdAt).replace(/[^0-9.]/g, '');
        let userJoinTime = formatTime(data.user.createdAt).split(":")

        if (logChannel) {
            const embed = new MessageEmbed()
                .setColor("#0efefe")
                .setTitle("User Joined")
                .setThumbnail(data.user.displayAvatarURL())
                .setDescription(`${data.user} ${data.user.tag}`)
                .setFooter(`ID: ${data.user.id}`)
                .setTimestamp()

            if (date - userJoinDate <= 3) {
                if (date - userJoinDate == 3)
                    embed.addField("**Warning** new user account:", `Accoount created 3 days ago: ${userJoinDate}.`);
                else if (date - userJoinDate == 2)
                    embed.addField("**Warning** new user account:", `Account created 2 days ago: ${userJoinDate}.`);
                else if (date - userJoinDate == 1)
                    embed.addField("**Warning** new user account:", `Account created 1 day ago: ${userJoinDate}.`);
                else if (date - userJoinDate == 0) {
                    let hour = 0;
                    let minute = 0;
                    let second = 0;

                    if (time[2] - userJoinTime[2] !== 0) second = time[2] - userJoinTime[2];
                    if (time[1] - userJoinTime[1] !== 0) minute = time[1] - userJoinTime[1];
                    if (time[0] - userJoinTime[0] !== 0) hour = time[0] - userJoinTime[0];
                    if (second < 0) {
                        second += 60;
                        minute--;
                    }
                    if (minute < 0) {
                        minute += 60;
                        hour--;
                    }

                    embed.addField("**Warning** new user account:", `Account created ${hour}hour(s), ${minute}minute(s), ${second}second(s) ago.`);
                }
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