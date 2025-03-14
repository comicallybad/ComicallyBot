const db = require("../../../utils/schemas/db.js");
const { EmbedBuilder } = require('discord.js');
const { s } = require('../../../utils/functions/functions.js');

module.exports = async (client, message) => {
    if (!message.guild) return;
    const guildID = message.guild.id;
    const messageID = message.id;

    db.updateOne({ guildID: guildID }, {
        $pull: { reactionRoles: { messageID: messageID } }
    }).catch(err => err);

    if (!message.content || !message.author) return;
    if (message.author.bot) return;

    const target = message.author;
    const logChannel = message.guild.channels.cache.find(channel => channel.name.includes("text-logs"));
    if (!logChannel || !target) return;

    const embed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("Message Deleted")
        .setThumbnail(target.displayAvatarURL())
        .setFooter({ text: `${target.tag} | ${target.id}`, iconURL: target.displayAvatarURL() })
        .setTimestamp()
        .addFields({
            name: "__**User**__",
            value: `${target}`,
            inline: true,
        }, {
            name: "__**Channel**__",
            value: `${message.channel}`,
            inline: true,
        })
        .setDescription(message.content && message.content.length <= 1020 ? message.content : message.content ? message.content.substring(0, 1020) + "`...`" : "No content")

    return s(logChannel, "", embed);
}