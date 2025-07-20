import { Client } from "discord.js";
import { formatLogTimestamp } from "../../utils/logUtils";

export default {
    name: "disconnect",
    execute(client: Client) {
        console.log(`${formatLogTimestamp()} [INFO] Client disconnected.`);
    },
};