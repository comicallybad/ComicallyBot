const mongoose = require('mongoose');

const dbSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    guildID: String,
    guildName: String,
    memberRoles: [Object],
    modRoles: [Object],
    commands: [Object],
    channels: [Object],
});

module.exports = mongoose.model("db", dbSchema)