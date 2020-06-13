const { del } = require("../../functions");

module.exports = {
    name: "say",
    aliases: ["send", "message"],
    category: "helpful",
    description: "Makes the bot say something.",
    permissions: "moderator",
    run: async (client, message, args) => {
        if (!args[0]) {
            return message.reply("Please provide a channel and something to say, or just something to say.").then(m => del(m, 7500));
        } else {
            if (message.mentions.channels.first()) {
                toSay = args.slice(1).join(' ');
                client.channels.cache.get(message.mentions.channels.first().id).send(toSay)
            } else {
                message.channel.send(args.join(' '));
            }
        }
    }
}