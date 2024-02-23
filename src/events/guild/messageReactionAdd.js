const { PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const { s, del } = require("../../../utils/functions/functions.js");;
const db = require("../../../utils/schemas/db.js");

module.exports = async (client, message, user) => {
    const hasManageRoles = client.guilds.cache.get(message.message.guildId)
        .members.me.permissions.has(PermissionFlagsBits.ManageRoles);

    if (!hasManageRoles || user.id === client.user.id) return;

    const fullMessage = message.partial ? await message.fetch() : message;
    checkDeleteReaction(fullMessage, user);
}

async function checkDeleteReaction(message, user) {
    const msg = message.message;
    const guildUser = msg.guild.members.cache.get(user.id);
    const guildID = msg.guild.id;
    const reaction = message._emoji.id || message._emoji.name;
    const exists = await db.findOne({ guildID: guildID });

    if (exists && exists.deleteReaction && exists.deleteReaction == reaction) {
        if (!isUserAllowedToDeleteMessage(exists, guildUser)) return;

        const author = await msg.guild.members.fetch(msg.author.id).catch(err => err);
        if (!author) return;

        const textLogChannel = findTextLogChannel(msg);
        const embed = buildEmbed(guildUser, author, msg);

        if (textLogChannel && author.id !== msg.guild.members.me.id) s(textLogChannel, '', embed);
        return del(msg, 0);
    }
}

function isUserAllowedToDeleteMessage(exists, guildUser) {
    const hasPermission = guildUser.permissions.has(PermissionFlagsBits.ManageMessages) || guildUser.id === process.env.USERID;
    return hasPermission;
}

function findTextLogChannel(msg) {
    return msg.guild.channels.cache.find(c => c.name.includes("text-logs")) || msg.guild.channels.cache.find(c => c.name.includes("mods-logs"));
}

function buildEmbed(guildUser, author, msg) {
    return new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle(`Message Deleted`)
        .setThumbnail(author.user.displayAvatarURL())
        .setFooter({ text: `Deleted message was sent`, iconURL: author.displayAvatarURL() })
        .setTimestamp(msg.createdAt)
        .addFields({
            name: "__**Author**__",
            value: `${author}`,
            inline: true,
        }, {
            name: `__**Channel**__`,
            value: `${msg.channel}`,
            inline: true
        }, {
            name: "__**Moderator**__",
            value: `${guildUser}`,
            inline: true
        })
        .setDescription(msg.content && msg.content.length <= 1020 ? msg.content : msg.content ? msg.content.substring(0, 1020) + "`...`" : "No content");
}