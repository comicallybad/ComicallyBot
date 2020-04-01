const db = require("../../schemas/db.js");

module.exports = async (client, message) => {
    let guildID = message.guild.id;
    let messageID = message.id;
    db.updateOne({ guildID: guildID }, {
        $pull: { reactionRoles: { messageID: messageID } }
    }).catch(err => console.log(err))
}