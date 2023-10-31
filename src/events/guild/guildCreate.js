const { dbSetup } = require("../../../utils/functions/dbFunctions.js");

module.exports = (client, guild) => {
    activities = [`${client.guilds.cache.size} servers!`, `${client.channels.cache.size} channels!`, `${client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)} users!`], i = 0;
    return dbSetup(client);
}