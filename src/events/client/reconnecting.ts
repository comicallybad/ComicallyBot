import { Client } from "discord.js";

export default {
    name: "reconnecting",
    execute(client: Client) {
        console.log(`Reconnecting at: ${new Date()}.`)
    },
};