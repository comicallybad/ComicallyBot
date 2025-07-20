import { Client } from "discord.js";
import { formatLogTimestamp } from "../../utils/logUtils";

export default {
    name: "resume",
    execute(client: Client, replayed: number) {
        console.log(`${formatLogTimestamp()} [INFO] Client resumed. Replayed ${replayed} events.`);
    },
};