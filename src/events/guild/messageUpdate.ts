import { Client, EmbedBuilder, Message } from "discord.js";
import { sendMessage } from "../../utils/messageUtils";
import { formatMessageContent } from "../../utils/stringUtils";
import { getLogChannel } from "../../utils/channelUtils";

export default {
    name: "messageUpdate",
    async execute(client: Client, oldMessage: Message, newMessage: Message) {
        if (!newMessage.guild || !newMessage.author || newMessage.author.bot) return;

        const target = newMessage.author || oldMessage.author;
        const logChannel = getLogChannel(newMessage.guild, ["text-logs"]);
        if (!logChannel || !target) return;

        const embed = new EmbedBuilder()
            .setColor("#FFA500")
            .setTitle("Message Edited")
            .setThumbnail(target.displayAvatarURL())
            .setFooter({ text: `${target.tag} | ${target.id}`, iconURL: target.displayAvatarURL() })
            .setTimestamp()
            .addFields(
                { name: "__**User**__", value: `${target}`, inline: true, },
                { name: "__**Channel**__", value: `${newMessage.channel}`, inline: true, },
                { name: "__**Message**__", value: `[View Message](${newMessage.url})`, inline: true, }
            )
            .setDescription(`__**Old Message**__\n${formatMessageContent(oldMessage)}\n__**New Message**__\n${formatMessageContent(newMessage)}`)

        return await sendMessage(logChannel, { embeds: [embed] });
    }
};