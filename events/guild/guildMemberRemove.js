const xp = require("../../schemas/xp.js")

module.exports = (client, data) => {
    activities = [`${client.guilds.cache.size} servers!`, `${client.channels.cache.size} channels!`, `${client.users.cache.size} users!`], i = 0;
    let userID = data.user.id;
    let guildID = data.guild.id;

    xp.deleteOne({ guildID: guildID, userID: userID }, {
    }).catch(err => console.log(err))
}