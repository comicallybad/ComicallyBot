const { EmbedBuilder } = require('discord.js');
const { s } = require('../../../utils/functions/functions.js');

module.exports = async (client, oldMessage, newMessage) => {
    if (!newMessage.guild || !newMessage.author) return;
    if (newMessage.author.bot) return;
    if (newMessage.content === oldMessage.content) return;

    const target = newMessage.author || oldMessage.author;
    const logChannel = newMessage.guild.channels.cache.find(channel => channel.name.includes("text-logs"));
    if (!logChannel || !target) return;

    const embed = new EmbedBuilder()
        .setColor("#FFA500")
        .setTitle("Message Edited")
        .setThumbnail(target.displayAvatarURL())
        .setFooter({ text: `${target.tag} | ${target.id}`, iconURL: target.displayAvatarURL() })
        .setTimestamp()
        .addFields({
            name: "__**User**__",
            value: `${target}`,
            inline: true,
        }, {
            name: "__**Channel**__",
            value: `${newMessage.channel}`,
            inline: true,
        }, {
            name: "__**Message**__",
            value: `[View Message](${newMessage.url})`,
            inline: true,
        })
        .setDescription(`__**Old Message**__\n${oldMessage.content}\n\n__**New Message**__\n${newMessage.content}`)

    return s(logChannel, "", embed);
}