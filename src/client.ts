import { Client, GatewayIntentBits, Partials } from "discord.js";
import { Manager } from "moonlink.js";
import { loadEvents } from "./handlers/eventHandler";
import { loadCommands } from "./handlers/commandHandler";
import { loadMusicEvents } from "./handlers/musicHandler";
import * as dotenv from "dotenv";

dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildExpressions,
        GatewayIntentBits.GuildMessageReactions
    ],
    partials: [
        Partials.Channel,
        Partials.Reaction,
        Partials.Message,
        Partials.GuildMember
    ]
});

if (!process.env.MUSIC) {
    throw new Error("MUSIC environment variable is not set.");
}

client.music = new Manager({
    nodes: [{
        identifier: "ComicallyBot",
        host: "localhost",
        password: `${process.env.MUSIC}`,
        port: 2333,
        secure: false
    }],
    options: { disableNativeSources: true },
    sendPayload: (guildId: string, payload: any) => {
        const guild = client.guilds.cache.get(guildId);
        if (guild) guild.shard.send(JSON.parse(payload));
    },
});

loadEvents(client);
loadCommands(client);
loadMusicEvents(client);

if (!process.env.DISCORD_TOKEN) {
    throw new Error("DISCORD_TOKEN environment variable is not set.");
}

try {
    client.login(process.env.DISCORD_TOKEN);
} catch (error: unknown) {
    throw new Error(`Failed to login to Discord: ${(error as Error).message}`);
}