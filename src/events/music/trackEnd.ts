import { Client } from "discord.js";
import { Player, Track } from "moonlink.js";
import { clearPlayerInterval } from "../../utils/musicUtils";

export default {
    name: "trackEnd",
    execute: async (client: Client, player: Player, track: Track, reason: string, payload: any) => {
        clearPlayerInterval(player);
    },
};