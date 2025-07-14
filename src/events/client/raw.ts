import { Client } from "discord.js";

export default {
    name: "raw",
    execute(client: Client, packet: { t: string; d: any; }) {
        client.music.packetUpdate(packet);
    },
};