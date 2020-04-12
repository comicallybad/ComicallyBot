const db = require("../../schemas/db.js");

module.exports = async (client, message) => {
    let messageID;
    let guildID;

    if (message) { //fix for cannot read property ID of null
        if (message.id) {
            messageID = message.id;
        } else return;
        if (message.guild.id) {
            guildID = message.guild.id
        } else return;
    } else return;

    db.updateOne({ guildID: guildID }, {
        $pull: { reactionRoles: { messageID: messageID } }
    }).catch(err => console.log(err))
}