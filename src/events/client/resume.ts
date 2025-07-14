import { Client } from "discord.js";

export default {
    name: "resume",
    execute(client: Client, replayed: number) {
        console.log(`Client resumed. Replayed ${replayed} events.`);
    },
};