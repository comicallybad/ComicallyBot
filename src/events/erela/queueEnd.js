const { s, del } = require("../../../utils/functions/functions.js");
const { EmbedBuilder } = require("discord.js");

module.exports = async (client, player) => {
    const channel = await client.channels.fetch(player.textChannel);

    if (player.options.message) del(player.options.message, 0);

    const embed = new EmbedBuilder()
        .setAuthor({ name: "Queue Ended!!", iconURL: client.user.displayAvatarURL() })
        .setDescription("🛑 The queue has ended and the bot has successfully disconnected!");

    s(channel, "", embed).then(m => del(m, 15000));

    return player.destroy();
}