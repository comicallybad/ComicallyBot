const mongoose = require('mongoose');

const dbSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    guildID: String,
    guildName: String,
    modRoles: [Object],
    verificationRole: [Object],
    commands: [Object],
    channels: [Object],
    xpMultiplier: Number,
    xpRoles: [Object],
    reactionRoles: [Object],
    xpSystem: Boolean,
    profanityFilter: Boolean,
    antiSpam: Boolean,
    antiPhishing: Boolean,
    badWordList: [String],
    welcomeMessage: [String],
    welcomeMessageReactions: [String],
    deleteReaction: String,
});

module.exports = mongoose.model("db", dbSchema)