import { Client } from "discord.js";
import { Player } from "moonlink.js";
import { deletePlayerState } from "../../utils/dbUtils";

export default {
    name: "playerDestroyed",
    execute: async (client: Client, player: Player) => {
        await deletePlayerState(player.guildId);
    },
};