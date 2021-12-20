const db = require("../../schemas/db.js");

module.exports = async (client, message) => {
    const fetchedLogs = await message.guild.fetchAuditLogs({
        limit: 1,
        type: 'MESSAGE_DELETE',
    });

    const deletionLog = fetchedLogs.entries.first();

    if (!deletionLog) return;

    const { executor, target } = deletionLog;
    let guildID, messageID;

    if (target.id === message.author.id) {
        guildID = message.guild.id;
        messageID = message.id;
    }

    db.updateOne({ guildID: guildID }, {
        $pull: { reactionRoles: { messageID: messageID } }
    }).catch(err => console.log(err))
}