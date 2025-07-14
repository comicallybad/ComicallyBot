import { Client } from "discord.js";

export default {
    name: "disconnect",
    execute(client: Client) {
        console.log(`Client disconnected at ${new Date()}.`);
    },
};