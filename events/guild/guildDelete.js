const db = require("../../schemas/db.js");

module.exports = (client, guild) => {
    activities = [`${client.guilds.cache.size} servers!`, `${client.channels.cache.size} channels!`, `${client.users.cache.size} users!`], i = 0;
    db.deleteOne({ guildID: guild.id }, {
    }).catch(err => console.log(err))
}