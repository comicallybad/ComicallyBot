const coins = require('../../schemas/coins.js');
const mongoose = require("mongoose");

module.exports = (client, data) => {
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