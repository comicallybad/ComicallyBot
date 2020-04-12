const db = require("../../schemas/db.js");

module.exports = async (client, message) => {
    if (message.partial) {
        message.fetch()
            .then(fullMessage => {
                checkReactionRole(fullMessage);
            });
    } else {
        checkReactionRole(message);
    }
}

function checkReactionRole(message) {
    let guildID = message.guild.id;
    let messageID = message.id;
    db.updateOne({ guildID: guildID }, {
        $pull: { reactionRoles: { messageID: messageID } }
    }).catch(err => console.log(err))
}