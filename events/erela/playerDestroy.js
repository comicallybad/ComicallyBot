const { del } = require("../../functions.js");

module.exports = async (client, player) => {
    if (player.options.message) return del(player.options.message, 0);
    else return;
}