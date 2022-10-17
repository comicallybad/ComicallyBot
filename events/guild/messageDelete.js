const db = require("../../schemas/db.js");

module.exports = async (client, message) => {
    if (!message.guild) return;
    const guildID = message.guild.id;
    const messageID = message.id;

    db.updateOne({ guildID: guildID }, {
        $pull: { reactionRoles: { messageID: messageID } }
    }).catch(err => err);
}