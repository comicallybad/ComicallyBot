const coins = require("../../schemas/coins.js")

module.exports = (client, data) => {
    activities = [`${client.guilds.cache.size} servers!`, `${client.channels.cache.size} channels!`, `${client.users.cache.size} users!`], i = 0;
    let user = data.user;
    let guild = data.guild;

    coins.deleteOne({ guildID: guild.id, userID: user.id }, {
    }).catch(err => console.log(err))
}