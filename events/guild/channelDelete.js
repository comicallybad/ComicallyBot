const db = require("../../schemas/db.js");

module.exports = async (client, channel) => {
    let channelID = channel.id;
    let guildID = channel.guild.id;

    db.updateOne({ guildID: guildID }, {
        $pull: { channels: { channelID: channelID } }
    }).catch(err => console.log(err))
}