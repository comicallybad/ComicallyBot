const { Client, Intents, Collection } = require("discord.js");
const fs = require("fs");
const { config } = require("dotenv");
const client = new Client({ ws: { intents: Intents.ALL }, partials: ['GUILD_MEMBER', 'REACTION', 'CHANNEL', 'MESSAGE'] });
const { Manager } = require("erela.js");

client.music = new Manager({
    nodes: [{ host: "localhost", port: 2333, password: "ErelaServerPassword!" }], send(id, payload) {
        const guild = client.guilds.cache.get(id);
        if (guild) guild.shard.send(payload);
    },
})

config({ path: __dirname + "/.env" });
global.prefix = "_";
global.voiceChannels = [], global.profanityUsers = [];
global.spamUsers = [], global.spamOffencers = [];
global.botChatters = [];

["aliases", "commands"].forEach(x => client[x] = new Collection());
["command", "event", "erela"].forEach(x => require(`./handlers/${x}`)(client));
require(`./handlers/error`)(client, process);
client.categories = new fs.readdirSync("./commands/");

client.login(process.env.TOKEN);