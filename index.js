const { Client, Collection } = require("discord.js");
const fs = require("fs");
const { config } = require("dotenv");
const client = new Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });

config({ path: __dirname + "/.env" });
global.prefix = "=";
global.voiceChannels = [];

["aliases", "commands"].forEach(x => client[x] = new Collection());
["command", "event"].forEach(x => require(`./handlers/${x}`)(client));
require(`./handlers/error`)(process);
client.categories = new fs.readdirSync("./commands/");

client.login(process.env.TOKEN);