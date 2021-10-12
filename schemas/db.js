const mongoose = require('mongoose');

const dbSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    guildID: String,
    guildName: String,
    memberRoles: [Object],
    modRoles: [Object],
    commands: [Object],
    channels: [Object],
    xpMultiplier: Number,
    xpRoles: [Object],
    reactionRoles: [Object],
    reactionCommands: [Object],
    xpSystem: Boolean,
    profanityFilter: Boolean,
    antiSpam: Boolean,
    badWordList: [String],
    welcomeMessage: [String],
    welcomeMessageReactions: [String],
});

module.exports = mongoose.model("db", dbSchema)