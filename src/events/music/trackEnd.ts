import { Client, Message } from "discord.js";
import { Player } from "moonlink.js";
import { deleteMessage } from "../../utils/messageUtils";

export default {
    name: "trackEnd",
    execute: async (client: Client, player: Player) => {
        if (player.data.message) {
            deleteMessage(player.data.message as Message, { timeout: 0 });
        }
    },
};