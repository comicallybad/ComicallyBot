const { addXP, checkWarn } = require("../../../utils/functions/dbFunctions.js");
const db = require("../../../utils/schemas/db.js");
const { Configuration, OpenAIApi } = require("openai")


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

    if (message.guild.members.me.isCommunicationDisabled()) return;

    const exists = await db.findOne({ guildID: message.guild.id, channels: { $elemMatch: { command: "Bot Chatting" } } });;
    if (exists) {
        let channel = await client.channels.cache.get(exists.channels.filter(x => x.command === "Bot Chatting")[0].channelID);
        if (message.channel == channel) {
            const config = new Configuration({ apiKey: process.env.OPENAI, organization: process.env.ORGANIZATION });
            const openai = new OpenAIApi(config);
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

                const result = await openai.createChatCompletion({
                    model: 'gpt-3.5-turbo',
                    messages: conversationLog,
                    // max_tokens: 256
                }).catch(err => console.log(`OpenAI error: ${err}`));

                message.reply(result.data.choices[0].message);
            } catch (err) {
                console.log(`An error occurred: ${err}`);
            }
        }
    } else return;
}