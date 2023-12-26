const db = require("../../../utils/schemas/db.js");

module.exports = async (client, messages) => {
    messages.forEach(message => {
        if (!message.id || !message.guild.id) return;
        const messageID = message.id;
        const guildID = message.guild.id

        db.updateOne({ guildID: guildID }, {
            $pull: { reactionRoles: { messageID: messageID } }
        }).catch(err => err);
    });
}