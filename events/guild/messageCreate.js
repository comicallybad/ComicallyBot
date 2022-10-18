const { s, r, del, getCommandStatus, hasPermissions, } = require("../../functions.js");
const { addXP, checkWarn } = require("../../dbFunctions.js");
const db = require("../../schemas/db.js");
const fetch = require('node-fetch');

let cooldown = new Set();
let cdseconds = 5;

module.exports = async (client, message) => {
    if (!message) return;
    if (message.author.bot) return;
    if (!message.guild) return;
    if (!message.member) message.member = await message.guild.members.fetch(message).catch(err => err);

    checkWarn(client, message);

    if (!cooldown.has(message.author.id))
        addXP(message, message.author.id);

    cooldown.add(message.author.id);

    setTimeout(() => {
        cooldown.delete(message.author.id);
    }, cdseconds * 1000);

    if (message.guild.me.isCommunicationDisabled()) return;

    if (!message.content.startsWith(prefix) && !message.content.replace(/\D/g, '').startsWith(`${client.user.id}`)) {
        db.findOne({ guildID: message.guild.id, channels: { $elemMatch: { command: "Bot Chatting" } } }, async (err, exists) => {
            if (exists) {
                let channel = await client.channels.cache.get(exists.channels.filter(x => x.command === "Bot Chatting")[0].channelID);
                if (message.channel == channel) {
                    let url = `https://www.cleverbot.com/getreply?key=${process.env.CLEVERBOT}&input=${message.content.replace(/[^\w\s!?]/g, '')}`, settings = { method: "Get" };
                    fetch(url, settings).then(res => res.json()).then((json) => {
                        if (json.output) return s(message.channel, `${json.output}`);
                    });
                }
            } else return;
        }).catch(err => err);
        return;
    }

    if (message.content.startsWith(prefix) || message.content.startsWith(`<@${client.user.id}>`)) {
        const args = message.content.startsWith(prefix) ? message.content.slice(prefix.length).trim().split(/ +/g) : message.content.slice(`<@${client.user.id}>`.length).trim().split(/ +/g);
        const cmd = args.shift().toLowerCase();

        if (cmd.length === 0) return;

        let command = client.commands.get(cmd) || client.commands.get(client.aliases.get(cmd));
        if (!command) return;

        const channelPermissions = message.channel.permissionsFor(message.guild.me);

        if (!channelPermissions?.has("VIEW_CHANNEL")) return;

        if (!channelPermissions?.has("SEND_MESSAGES"))
            return message.author.send("I am missing permissions to `SEND_MESSAGES`").catch(err => err);

        if (message.channel.type.includes("THREAD") && !channelPermissions?.has("SEND_MESSAGES_IN_THREADS"))
            return message.author.send("I am missing permissions to `SEND_MESSAGES_IN_THREADS`").catch(err => err);

        if (!channelPermissions?.has("READ_MESSAGE_HISTORY"))
            return r(message.channel, message.author, "I am missing permissions to `READ_MESSAGE_HISTORY` for certain commands.").then(m => del(m, 30000));

        let perms = await hasPermissions(message, command.permissions);
        let cmdStatus = await getCommandStatus(message, command.name);

        del(message, 0);
        try {
            if (command.category !== 'command' && command.category !== "owner" && command.category !== "support") {
                if (!cmdStatus) return r(message.channel, message.author, "This command is currently disabled.").then(m => del(m, 7500));
                if (!perms) return r(message.channel, message.author, "You do not have permissions for this command.").then(m => del(m, 7500))
                else return command.run(client, message, args);
            } else {
                if (!perms) return r(message.channel, message.author, "You do not have permissions for this command.").then(m => del(m, 7500));
                else return command.run(client, message, args);
            }
        } catch (err) {
            console.log(`Error running ${command}: ${err.stack}`);
        }
    }
}