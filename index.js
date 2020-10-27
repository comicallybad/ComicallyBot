const { Client, Intents, Collection } = require("discord.js");
const fs = require("fs");
const { config } = require("dotenv");
const client = new Client({ws: {intents: Intents.ALL},partials: ['GUILD_MEMBER','REACTION','CHANNEL', 'MESSAGE']});

config({ path: __dirname + "/.env" });
global.prefix = "_";
global.voiceChannels = [], global.profanityUsers = [];
global.spamUsers = [], global.spamOffencers = [];

["aliases", "commands"].forEach(x => client[x] = new Collection());
["command", "event"].forEach(x => require(`./handlers/${x}`)(client));
require(`./handlers/error`)(client, process);
client.categories = new fs.readdirSync("./commands/");

client.login(process.env.TOKEN);