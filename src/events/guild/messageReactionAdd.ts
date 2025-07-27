import { MessageReaction, User, PermissionFlagsBits, EmbedBuilder, Message, PartialMessage, Client, GuildMember } from "discord.js";
import { sendMessage, deleteMessage } from "../../utils/messageUtils";
import { GuildConfig } from "../../models/GuildConfig";
import { getLogChannel } from "../../utils/channelUtils";

export default {
    name: "messageReactionAdd",
    async execute(client: Client, messageReaction: MessageReaction, user: User) {
        const hasManageMessages = messageReaction.message.guild?.members.me?.permissions.has(PermissionFlagsBits.ManageMessages);

        if (!hasManageMessages || user.id === client.user?.id) return;

        const fullMessage = messageReaction.partial ? await messageReaction.fetch() : messageReaction;
        checkDeleteReaction(fullMessage, user, client.user?.id);
    },
};

async function checkDeleteReaction(messageReaction: MessageReaction, user: User, botUserId: string | undefined) {
    const msg = messageReaction.message;
    const guildUser = msg.guild?.members.cache.get(user.id);
    const guildID = msg.guild?.id;
    const reaction = messageReaction.emoji.toString();

    if (!guildID) return;

    if (guildUser?.id === process.env.BOT_OWNER_ID && reaction === "🗑️") {
        await deleteMessage(msg as Message, { timeout: 0 });
        return;
    }

    const exists = await GuildConfig.findOne({ guildID: guildID });

    if (exists && exists.deleteReaction && exists.deleteReaction === reaction) {
        if (!guildUser?.permissions.has(PermissionFlagsBits.ManageMessages) && guildUser?.id !== process.env.BOT_OWNER_ID) return;

        const author = await msg.guild?.members.fetch(msg.author?.id || "").catch(() => null);
        if (!author) return;

        const textLogChannel = getLogChannel(msg.guild, ["text-logs"]);
        const embed = buildEmbed(guildUser, author, msg);

        if (textLogChannel && author.id !== botUserId) {
            await sendMessage(textLogChannel, { embeds: [embed] });
        }
        await deleteMessage(msg as Message, { timeout: 0 });
    }
}

function buildEmbed(guildUser: GuildMember | undefined, author: User | GuildMember | undefined, msg: Message | PartialMessage) {
    const authorDisplayAvatarURL = (author as GuildMember)?.user?.displayAvatarURL() || (author as User)?.displayAvatarURL() || '';

    return new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle(`Message Deleted`)
        .setThumbnail(authorDisplayAvatarURL)
        .setFooter({ text: `Deleted message was sent`, iconURL: authorDisplayAvatarURL })
        .setTimestamp(msg.createdAt || null)
        .addFields({
            name: "__**Author**__",
            value: `${author || 'Unknown'}`,
            inline: true,
        }, {
            name: `__**Channel**__`,
            value: `${msg.channel || 'Unknown'}`,
            inline: true
        }, {
            name: "__**Moderator**__",
            value: `${guildUser || 'Unknown'}`,
            inline: true
        })
        .setDescription(msg.content && msg.content.length <= 1020 ? msg.content : msg.content ? msg.content.substring(0, 1020) + "`...`" : "No content");
}