const { checkWarn } = require("../../../utils/functions/dbFunctions.js");
const db = require("../../../utils/schemas/db.js");
const OpenAI = require("openai");

module.exports = async (client, message) => {
    if (!message) return;
    if (message.author.bot) return;
    if (!message.guild) return;
    if (!message.member) message.member = await message.guild.members.fetch(message).catch(err => err);

    checkWarn(client, message);

    if (message.guild.members.me.isCommunicationDisabled()) return;

    const exists = await db.findOne({ guildID: message.guild.id, channels: { $elemMatch: { command: "Bot Chatting" } } });;
    if (!exists) return;

    let channel = await client.channels.cache.get(exists.channels.filter(x => x.command === "Bot Chatting")[0].channelID);
    if (message.channel !== channel) return;

    const openai = new OpenAI({ apiKey: process.env.OPENAI });
    let conversationLog = [{ role: 'system', content: 'You are a sarcastic but helpful chatbot.' }];

    try {
        await message.channel.sendTyping();

        let prevMessages = await message.channel.messages.fetch({ limit: 15 });
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