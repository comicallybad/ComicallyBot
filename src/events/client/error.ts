import { Client } from "discord.js";
import { logError } from "../../utils/logUtils";

export default {
    name: "error",
    execute(client: Client, error: Error) {
        logError(error, "Client Error");
    },
};