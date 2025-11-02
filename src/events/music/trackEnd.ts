import { Client } from "discord.js";
import { Player } from "moonlink.js";
import { clearPlayerInterval } from "../../utils/musicUtils";

export default {
    name: "trackEnd",
    execute: async (client: Client, player: Player) => {
        clearPlayerInterval(player);
    },
};