import { Client } from "discord.js";
import { Node } from "moonlink.js";
import { formatLogTimestamp } from "../../utils/logUtils";

export default {
    name: "nodeConnected",
    execute: async (client: Client, node: Node) => {
        console.log(`${formatLogTimestamp()} [SUCCESS] Lavalink Node ${node.identifier} connected.`);
    }
};