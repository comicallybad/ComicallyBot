import { ShardingManager } from "discord.js";
import * as dotenv from "dotenv";
import { loadProcessErrorHandlers } from "./handlers/processErrorHandler";
import { formatLogTimestamp } from "./utils/logUtils";

dotenv.config();

loadProcessErrorHandlers();

if (!process.env.DISCORD_TOKEN) {
    throw new Error("DISCORD_TOKEN environment variable is not set.");
}

const manager = new ShardingManager("./dist/client.js", {
    token: process.env.DISCORD_TOKEN,
});

manager.on("shardCreate", shard => {
    console.log(`${formatLogTimestamp()} [INFO] Shard ${shard.id} launched`);
});

try {
    manager.spawn();
} catch (error: unknown) {
    throw new Error(`Failed to spawn shards: ${(error as Error).message}`);
}