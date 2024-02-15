const mongoose = require('mongoose');

const dbSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    guildID: String,
    guildName: String,
    channels: [Object],
    reactionRoles: [Object],
    antiSpam: Boolean,
    antiPhishing: Boolean,
    welcomeMessage: [String],
    deleteReaction: String,
});

module.exports = mongoose.model("db", dbSchema)