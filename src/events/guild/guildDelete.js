const db = require("../../../utils/schemas/db.js");
const xp = require("../../../utils/schemas/xp.js");

module.exports = (client, guild) => {
    if (!guild) return;
    if (!guild.id) return;
    activities = [`${client.guilds.cache.size} servers!`, `${client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)} users!`], i = 0;
    db.deleteOne({ guildID: guild.id }).catch(err => err)
    xp.deleteMany({ guildID: guild.id }).catch(err => err)
}