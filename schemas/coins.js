const mongoose = require('mongoose');

const coinsSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    guildID: String,
    guildName: String,
    userID: String,
    userName: String,
    coins: Number
});

module.exports = mongoose.model("coins", coinsSchema)