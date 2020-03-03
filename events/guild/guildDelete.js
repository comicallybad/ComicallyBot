const db = require("../../schemas/db.js");

module.exports = (client, guild) => {
    db.deleteOne({ guildID: guild.id }, {
    }).catch(err => console.log(err))
}