const { EmbedBuilder } = require("discord.js");
const { s, del } = require("../../../utils/functions/functions.js");

module.exports = async (client, player) => {
    const channel = await client.channels.fetch(player.textChannelId);

    if (player.data.message) del(player.data.message, 0);

    const embed = new EmbedBuilder()
        .setAuthor({ name: "Queue Ended!", iconURL: client.user.displayAvatarURL() })
        .setColor("#FF0000")
        .setDescription("🛑 The queue has ended, and the bot successfully disconnected!");

    return s(channel, "", embed).then(m => del(m, 15000));
}