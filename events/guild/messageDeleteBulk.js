const db = require("../../schemas/db.js");

module.exports = async (client, messages) => {
    messages.forEach(message => {
        let messageID;
        let guildID;
        if (!message) return;
        if (message.id) {
            messageID = message.id;
        } else return;
        if (message.guild) {
            guildID = message.guild.id
        } else return;

        db.updateOne({ guildID: guildID }, {
            $pull: { reactionRoles: { messageID: messageID } }
        }).catch(err => err);
    });
}