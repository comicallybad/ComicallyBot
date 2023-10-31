const { Client, Collection, GatewayIntentBits } = require("discord.js");
const fs = require("fs");
const { config } = require("dotenv");
const intents = [
    GatewayIntentBits.Guilds, GatewayIntentBits.GuildBans, GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildInvites, GatewayIntentBits.DirectMessages, GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildVoiceStates
];
const client = new Client({ intents: intents, partials: ['GUILD_MEMBER', 'REACTION', 'CHANNEL', 'MESSAGE'] });
const { Manager } = require("erela.js");
const AntiSpam = require('discord-anti-spam');

client.music = new Manager({
    nodes: [{ host: "localhost", port: 2333, password: process.env.ERELA }], send: (id, payload) => {
        const guild = client.guilds.cache.get(id);
        if (guild) guild.shard.send(payload);
    }
});

client.antiSpam = new AntiSpam({
    warnThreshold: 5, muteThreshold: 7, kickThreshold: 99, banThreshold: 99, maxInterval: 2000,
    warnMessage: '{@user}, **Please stop spamming or you will be timed out.**',
    muteMessage: '{@user} has been **timed out** for **spamming.**',
    unMuteTime: 10, ignoreBots: true, verbose: false, removeMessages: true,
    ignoredPermissions: ["MANAGE_NICKNAMES"], ignoredMembers: [`${process.env.USERID}`]
});

process.on('warning', e => console.warn(e.stack));
config({ path: __dirname + "/.env" });
global.prefix = "=";
global.voiceChannels = [], global.warnUsers = [];

client.commands = new Collection();
client.categories = new fs.readdirSync("./src/commands/");

["command", "event", "erela", "antiSpam"].forEach(x => require(`./handlers/${x}`)(client));
// require(`./handlers/error`)(client, process);

client.setMaxListeners(25);

client.login(process.env.TOKEN);