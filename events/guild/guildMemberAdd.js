const xp = require('../../schemas/xp.js');
const mongoose = require("mongoose");

module.exports = (client, data) => {
    activities = [`${client.guilds.cache.size} servers!`, `${client.channels.cache.size} channels!`, `${client.users.cache.size} users!`], i = 0;
    let guildID = data.guild.id;
    let guildName = data.guild.name;
    let userID = data.user.id;
    let userName = data.user.username;

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