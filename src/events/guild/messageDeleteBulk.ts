import { Collection, Message, Client, EmbedBuilder, TextChannel } from "discord.js";
import { sendMessage } from "../../utils/messageUtils";

export default {
    name: "messageDeleteBulk",
    async execute(client: Client, messages: Collection<string, Message>) {
        const logChannel = messages.first()?.guild?.channels.cache.find(channel => channel.name.includes("text-logs")) as TextChannel;
        if (!logChannel) return;

        const embed = new EmbedBuilder()
            .setColor("#FF0000")
            .setTitle(`Messages Deleted`)
            .setDescription(`${messages.map(message => `${message.author}: ${message.content}`).join('\n')}`)
            .setTimestamp();

        return await sendMessage(logChannel, { embeds: [embed] });
    },
};