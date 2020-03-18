const coins = require('../../schemas/coins.js');
const mongoose = require("mongoose");

module.exports = (client, data) => {
    activities = [`${client.guilds.cache.size} servers!`, `${client.channels.cache.size} channels!`, `${client.users.cache.size} users!`], i = 0;
    let user = data.user;
    let guild = data.guild;

    coins.findOne({ guildID: guild.id, userID: user.id }, (err, exists) => {
        if (!exists) {
            const newCoins = new coins({
                _id: mongoose.Types.ObjectId(),
                guildID: guild.id, guildName: guild.name,
                userID: user.id, userName: user.username, coins: 0
            })
            newCoins.save().catch(err => console.log(err));
        }
    });
}