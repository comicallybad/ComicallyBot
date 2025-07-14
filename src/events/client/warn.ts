import { Client } from "discord.js";

export default {
    name: "warn",
    execute(client: Client, info: string) {
        console.warn("Client warning:", info);
    },
};