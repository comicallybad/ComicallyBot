const coins = require("../../schemas/coins.js")

module.exports = (client, data) => {
    let user = data.user;
    let guild = data.guild;

    coins.deleteOne({ guildID: guild.id, userID: user.id }, {
    }).catch(err => console.log(err))
}