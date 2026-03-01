import { Client, EmbedBuilder, TextChannel } from "discord.js";
import { Player } from "moonlink.js";
import { deletePlayerState } from "../../utils/dbUtils";
import { sendMessage, deleteMessage } from "../../utils/messageUtils";
import { clearPlayerInterval } from "../../utils/musicUtils";

export default {
    name: "playerDestroyed",
    execute: async (client: Client, player: Player) => {
        await deletePlayerState(player.guildId);

        const channel = await client.channels.fetch(player.textChannelId) as TextChannel;

        clearPlayerInterval(player);

        const embed = new EmbedBuilder()
            .setAuthor({ name: "Queue Ended!", iconURL: client.user?.displayAvatarURL() })
            .setColor("#FF0000")
            .setDescription("🛑 The queue has ended, and the bot successfully disconnected!");

        const sentMessage = await sendMessage(channel, { embeds: [embed] });
        if (sentMessage) {
            deleteMessage(sentMessage, { timeout: 30000 });
        }
    },
};