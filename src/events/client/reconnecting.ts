import { Client } from "discord.js";
import { formatLogTimestamp } from "../../utils/logUtils";

export default {
    name: "reconnecting",
    execute(client: Client) {
        console.log(`${formatLogTimestamp()} [INFO] Reconnecting...`);
    },
};