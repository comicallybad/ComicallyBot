import { Client } from "discord.js";
import { formatLogTimestamp } from "../../utils/logUtils";

export default {
    name: "warn",
    execute(client: Client, info: string) {
        console.warn(`${formatLogTimestamp()} [WARN] Client warning: ${info}`);
    },
};