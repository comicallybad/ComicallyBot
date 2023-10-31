const mongoose = require('mongoose');

const xpSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    guildID: String,
    guildName: String,
    userID: String,
    userName: String,
    userNickname: String,
    userDisplayAvatarURL: String,
    xp: Number,
    level: Number
});

module.exports = mongoose.model("xp", xpSchema)