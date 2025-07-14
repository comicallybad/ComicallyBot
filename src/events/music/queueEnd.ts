import { Client, EmbedBuilder, TextChannel, Message } from "discord.js";
import { Player } from "moonlink.js";
import { sendMessage, deleteMessage } from "../../utils/messageUtils";

export default {
    name: "queueEnd",
    execute: async (client: Client, player: Player) => {
        const channel = await client.channels.fetch(player.textChannelId) as TextChannel;

        if (player.data.message) {
            deleteMessage(player.data.message as Message, { timeout: 0 });
        }

        const embed = new EmbedBuilder()
            .setAuthor({ name: "Queue Ended!", iconURL: client.user?.displayAvatarURL() })
            .setColor("#FF0000")
            .setDescription("🛑 The queue has ended, and the bot successfully disconnected!");

        const sentMessage = await sendMessage(channel, { embeds: [embed.toJSON()] });
        if (sentMessage) {
            deleteMessage(sentMessage, { timeout: 15000 });
        }
    },
};