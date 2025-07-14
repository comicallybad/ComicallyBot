import { Client } from "discord.js";
import { Node } from "moonlink.js";

export default {
    name: "nodeConnected",
    execute: async (client: Client, node: Node) => {
        console.log(`Successfully connected to Lavalink.`);
    },
};