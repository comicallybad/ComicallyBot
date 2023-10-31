const db = require("../../../utils/schemas/db.js");

module.exports = (client, channel) => {
    let channelID = channel.id;
    let guildID = channel.guild.id;

    db.updateOne({ guildID: guildID }, {
        $pull: { channels: { channelID: channelID } }
    }).catch(err => err)
}