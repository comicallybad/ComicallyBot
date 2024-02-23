const db = require("../../../utils/schemas/db.js");

module.exports = (client, channel) => {
    const channelID = channel.id;
    const guildID = channel.guild.id;

    db.updateOne({ guildID: guildID }, {
        $pull: { channels: { channelID: channelID } }
    }).catch(err => err)
}