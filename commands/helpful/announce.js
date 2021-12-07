const { del } = require("../../functions");

module.exports = {
    name: "announce",
    aliases: ["say"],
    category: "helpful",
    description: "Makes the bot say something.",
    permissions: "moderator",
    usage: "[#channel] <message>",
    run: async (client, message, args) => {
        if (!args[0]) {
            return message.reply("Please provide a channel and something to say, or just something to say.").then(m => del(m, 7500));
        } else {
            let channelMentionID = args[0].replace("<#", "").slice(args[0].replace("<#", "").indexOf(":") + 1, args[0].replace("<#", "").length - 1);
            if (message.mentions.channels.first()) {
                if (message.mentions.channels.first().id === channelMentionID) {
                    let toSay = args.slice(1).join(' ');
                    let channel = await message.guild.channels.cache.get(message.mentions.channels.first().id);

                    return channel.send(toSay).catch(err => message.reply(`There was an error sending a message to that channel. ${err}`).then(m => del(m, 7500)));
                } else {
                    return message.channel.send(args.join(' '));
                }
            } else {
                return message.channel.send(args.join(' '));
            }
        }
    }
}