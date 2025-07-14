import { Client, EmbedBuilder, Message, TextChannel } from "discord.js";
import { sendMessage } from "../../utils/messageUtils";
import { formatMessageContent } from "../../utils/stringUtils";

export default {
    name: "messageUpdate",
    async execute(client: Client, oldMessage: Message, newMessage: Message) {
        if (!newMessage.guild || !newMessage.author) return;
        if (newMessage.author.bot) return;
        if (newMessage.content === oldMessage.content) return;

        const target = newMessage.author || oldMessage.author;
        const logChannel = newMessage.guild.channels.cache.find(channel => channel.name.includes("text-logs")) as TextChannel;
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
            .setDescription(`__**Old Message**__
${formatMessageContent(oldMessage)}

__**New Message**__
${formatMessageContent(newMessage)}`)

        return await sendMessage(logChannel, { embeds: [embed] });
    }
};