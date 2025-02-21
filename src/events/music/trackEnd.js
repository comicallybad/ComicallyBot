const { del } = require("../../../utils/functions/functions.js");

module.exports = async (client, player) => {
    if (player.data.message) del(player.data.message, 0);
}