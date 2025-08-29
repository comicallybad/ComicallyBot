import { Client, EmbedBuilder, Message, PartialMessage } from "discord.js";
import { sendMessage } from "../../utils/messageUtils";
import { formatMessageContent, createDiff } from "../../utils/stringUtils";
import { getLogChannel } from "../../utils/channelUtils";

export default {
    name: "messageUpdate",
    async execute(client: Client, oldMessage: Message | PartialMessage, newMessage: Message | PartialMessage) {
        if (newMessage.partial) {
            try {
                newMessage = await newMessage.fetch();
            } catch (error) {
                return;
            }
        }

        if (!newMessage.guild || !newMessage.author || newMessage.author.bot) return;

        const target = newMessage.author;
        const logChannel = getLogChannel(newMessage.guild, ["text-logs"]);
        if (!logChannel || !target) return;

        let description: string;

        if (oldMessage.partial) {
            description = `*Old message not in cache, so no diff could be generated.*`;
        } else {
            description = createDiff(formatMessageContent(oldMessage), formatMessageContent(newMessage));
        }

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
            .setDescription(description.length > 4096 ? description.substring(0, 4093) + "..." : description)

        return await sendMessage(logChannel, { embeds: [embed] });
    }
};