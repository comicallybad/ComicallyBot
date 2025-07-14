import { Message, Client } from "discord.js";

export default {
    name: "messageCreate",
    execute(client: Client, message: Message) {
        if (message.author.bot) return;
        // console.log(`New message from ${message.author.tag}: ${message.content}`);
    },
};