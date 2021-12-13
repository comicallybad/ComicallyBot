const { ShardingManager } = require('discord.js');
const { config } = require("dotenv");

config({ path: __dirname + "/.env" });

const manager = new ShardingManager('./client.js', { token: process.env.TOKEN, totalShards: 'auto', shardList: "auto" });

manager.on('shardCreate', async (shard) => console.log(`Launched shard ${shard.id}`));

manager.spawn(manager.totalShards, 10000);
