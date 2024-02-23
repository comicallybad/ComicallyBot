const { PermissionFlagsBits } = require("discord.js")
const { del } = require("../../../utils/functions/functions.js");
const { checkWarn } = require("../../../utils/functions/dbFunctions.js");
const db = require("../../../utils/schemas/db.js");
const OpenAI = require("openai");

module.exports = async (client, message) => {
    if (!message || !message.guild || message.author.bot) return;
    if (!message.member) message.member = await message.guild.members.fetch(message).catch(err => err);
    if (message.guild.members.me.isCommunicationDisabled()) return;

    checkWarn(client, message);
    checkOwnerCommand(client, message);
    checkAutoChat(client, message);
}

function checkOwnerCommand(client, message) {
    if (!message.content.startsWith("_") || !message.content.startsWith(`<@${client.user.id}>`) && message.author.id !== process.env.USERID) return;
    const args = message.content.startsWith("_") ? message.content.slice("_".length).trim().split(/ +/g) : message.content.slice(`<@${client.user.id}>`.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();

    if (cmd.length === 0) return;

    const command = client.commands.get(cmd) || client.commands.get(client.aliases.get(cmd));
    if (!command) return;

    const channelPermissions = message.channel.permissionsFor(message.guild.members.me);

    if (!channelPermissions?.has(PermissionFlagsBits.ViewChannel)) return;

    if (!channelPermissions?.has(PermissionFlagsBits.SendMessages))
        return message.author.send("I am missing permissions to `SEND_MESSAGES`").catch(err => err);

    del(message, 0);

    try {
        return command.run(client, message, args);
    } catch (err) {
        console.log(`Error running ${command}: ${err.stack}`);
    }
    return;
}

async function checkAutoChat(client, message) {
    const exists = await db.findOne({ guildID: message.guild.id, channels: { $elemMatch: { command: "Bot Chatting" } } });;
    if (!exists) return;

    const channel = await client.channels.cache.get(exists.channels.filter(x => x.command === "Bot Chatting")[0].channelID);
    if (message.channel !== channel) return;

    const openai = new OpenAI({ apiKey: process.env.OPENAI });
    const conversationLog = [{ role: 'system', content: 'You are a sarcastic but helpful chatbot.' }];

    try {
        await message.channel.sendTyping();

        const prevMessages = await message.channel.messages.fetch({ limit: 15 });
        prevMessages.reverse();

        prevMessages.forEach((msg) => {
            if (msg.author.id !== client.user.id && message.author.bot) return;
            if (msg.author.id !== message.author.id) return;
            conversationLog.push({ role: 'user', content: msg.content, });
        });

        const result = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: conversationLog,
            // max_tokens: 256
        }).catch(err => console.log(`OpenAI error: ${err}`));

        if (result.choices[0].message.content.length >= 1950) {
            message.reply({ content: `${result.choices[0].message.content.slice(0, 1950)}` })
            message.channel.send({ content: `${result.choices[0].message.content.slice(1950, result.choices[0].message.content.length)}` }).catch(err => err);
        } else message.reply(result.choices[0].message);
    } catch (err) {
        console.log(`An error occurred: ${err}`);
    }
}