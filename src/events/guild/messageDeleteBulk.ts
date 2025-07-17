import { Collection, Message, Client, EmbedBuilder, TextChannel } from "discord.js";
import { sendMessage } from "../../utils/messageUtils";
import { getLogChannel } from "../../utils/channelUtils";

export default {
    name: "messageDeleteBulk",
    async execute(client: Client, messages: Collection<string, Message>) {
        const guild = messages.first()?.guild;
        if (!guild || messages.size === 0) return;

        const logChannel = getLogChannel(guild, ["text-logs"]);
        if (!logChannel) return;

        const embed = new EmbedBuilder()
            .setColor("#FF0000")
            .setTitle(`Messages Deleted`)
            .setDescription(`${messages.map(message => `${message.author}: ${message.content}`).join('\n')}`)
            .setTimestamp();

        return await sendMessage(logChannel, { embeds: [embed] });
    },
};