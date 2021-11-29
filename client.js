const { Client, Intents, Collection } = require("discord.js");
const fs = require("fs");
const { config } = require("dotenv");
const intents = [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_BANS, Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS, Intents.FLAGS.GUILD_INVITES,
Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_VOICE_STATES];
const client = new Client({ intents: intents, partials: ['GUILD_MEMBER', 'REACTION', 'CHANNEL', 'MESSAGE'] });
const { Manager } = require("erela.js");
const AntiSpam = require('discord-anti-spam');

client.music = new Manager({
    nodes: [{ host: "localhost", port: 2333, password: process.env.ERELA }], send(id, payload) {
        const guild = client.guilds.cache.get(id);
        if (guild) guild.shard.send(payload);
    },
});

client.antiSpam = new AntiSpam({
    warnThreshold: 5, muteThreshold: 7, kickThreshold: 99, banThreshold: 99, maxInterval: 2000,
    warnMessage: '{@user}, Please stop spamming or you will be muted.',
    kickMessage: '**{user_tag}** has been kicked for spamming.',
    muteMessage: '**{user_tag}** has been muted for spamming.',
    maxDuplicatesWarning: 6, maxDuplicatesKick: 99, maxDuplicatesBan: 99, maxDuplicatesMute: 8,
    ignoredPermissions: ['MANAGE_NICKNAMES'],
    ignoreBots: true, verbose: false, muteRoleName: "Muted",
    removeMessages: true, removeBotMessages: false, ignoreBots: true,
    ignoredPermissions: ['MANAGE_NICKNAMES', 'MANAGE_MESSAGES'],
    verbose: false, muteRoleName: "Muted", removeMessages: true,
});

config({ path: __dirname + "/.env" });
global.prefix = "_";
global.voiceChannels = [], global.profanityUsers = [];

["aliases", "commands"].forEach(x => client[x] = new Collection());
["command", "event", "erela", "antiSpam"].forEach(x => require(`./handlers/${x}`)(client));
require(`./handlers/error`)(client, process);
client.categories = new fs.readdirSync("./commands/");

client.login(process.env.TOKEN);