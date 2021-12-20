const db = require("../../schemas/db.js");

module.exports = async (client, message) => {
    const guildID = message.guild.id;
    const messageID = message.id;

    db.updateOne({ guildID: guildID }, {
        $pull: { reactionRoles: { messageID: messageID } }
    }).catch(err => console.log(err))
}