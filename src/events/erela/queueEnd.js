const { EmbedBuilder } = require("discord.js");
const { s, del } = require("../../../utils/functions/functions.js");

module.exports = async (client, player) => {
    const channel = await client.channels.fetch(player.textChannel);

    if (player.options.message) del(player.options.message, 0);

    const embed = new EmbedBuilder()
        .setAuthor({ name: "Queue Ended!", iconURL: client.user.displayAvatarURL() })
        .setColor("#FF0000")
        .setDescription("🛑 The queue has ended, and the bot successfully disconnected!");

    s(channel, "", embed).then(m => del(m, 15000));

    return player.destroy();
}