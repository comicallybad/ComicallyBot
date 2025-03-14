const { Client, Collection, GatewayIntentBits, Partials } = require("discord.js");
const { config } = require("dotenv");
const { Manager } = require("moonlink.js");
const fs = require("fs");
const intents = [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildMessageReactions
];

const client = new Client({
    intents: intents,
    partials: [
        Partials.Channel,
        Partials.Reaction,
        Partials.Message,
        Partials.GuildMember
    ]
});

client.music = new Manager({
    nodes: [{
        identifier: "ComicallyBot",
        host: "localhost",
        password: `${process.env.MUSIC}`,
        port: 2333,
        secure: false
    }],
    options: {},
    sendPayload: (guildId, payload) => {
        const guild = client.guilds.cache.get(guildId);
        if (guild) guild.shard.send(JSON.parse(payload));
    },
});

config({ path: __dirname + "/.env" });
global.voiceChannels = [], global.warnUsers = [];

client.commands = new Collection();
client.aliases = new Collection();
client.categories = new fs.readdirSync("./src/commands/");

["command", "event", "music"].forEach(x => require(`./handlers/${x}`)(client));
require(`./handlers/error`)(client, process);

client.setMaxListeners(25);

client.login(process.env.TOKEN);