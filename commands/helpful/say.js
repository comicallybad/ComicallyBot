const { del } = require("../../functions");

module.exports = {
    name: "say",
    aliases: ["send", "message"],
    category: "helpful",
    description: "Makes the bot say something.",
    permissions: "moderator",
    usage: "[#channel] <message>",
    run: async (client, message, args) => {
        if (!args[0]) {
            return message.reply("Please provide a channel and something to say, or just something to say.").then(m => del(m, 7500));
        } else {
            if (message.mentions.channels.first()) {
                let toSay = args.slice(1).join(' ');
                let channel = client.channels.cache.get(message.mentions.channels.first().id)

                channel.send(toSay).catch(err => message.reply(`There was an error sending a message to that channel. ${err}`).then(m => del(m, 7500)));
            } else {
                message.channel.send(args.join(' '));
            }
        }
    }
}