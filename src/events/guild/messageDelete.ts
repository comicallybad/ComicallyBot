import { Message, Client, EmbedBuilder, TextChannel } from "discord.js";
import { sendMessage } from "../../utils/messageUtils";
import { formatMessageContent } from "../../utils/stringUtils";
import { getLogChannel } from "../../utils/channelUtils";

export default {
    name: "messageDelete",
    async execute(client: Client, message: Message) {
        if (!message.guild || !message.author || message.author.bot) return;

        const target = message.author;
        const logChannel = getLogChannel(message.guild, ["text-logs"]);
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
            .setDescription(formatMessageContent(message));

        return await sendMessage(logChannel, { embeds: [embed] });
    },
};