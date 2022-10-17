const { Client, Intents, Collection } = require("discord.js");
const fs = require("fs");
const { config } = require("dotenv");
const intents = [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_BANS, Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS, Intents.FLAGS.GUILD_INVITES, Intents.FLAGS.DIRECT_MESSAGES,
Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_VOICE_STATES];
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
    unMuteTime: 5, ignoreBots: true, verbose: false, removeMessages: true,
    ignoredPermissions: ["MANAGE_NICKNAMES"], ignoredMembers: [`${process.env.USERID}`]
});

config({ path: __dirname + "/.env" });
global.prefix = "=";
global.voiceChannels = [], global.warnUsers = [];

["aliases", "commands"].forEach(x => client[x] = new Collection());
["command", "event", "erela", "antiSpam"].forEach(x => require(`./handlers/${x}`)(client));
// require(`./handlers/error`)(client, process);
client.categories = new fs.readdirSync("./commands/");

client.login(process.env.TOKEN);