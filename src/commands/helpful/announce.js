const { s, r, del } = require("../../../utils/functions/functions.js");

module.exports = {
    name: "announce",
    aliases: ["say"],
    category: "helpful",
    description: "Makes the bot say something.",
    permissions: "moderator",
    usage: "[#channel] <message>",
    run: async (client, message, args) => {
        if (!args[0])
            return r(message.channel, message.author, "Please provide a channel and something to say, or just something to say.").then(m => del(m, 7500));

        let channelMentionID = args[0].replace("<#", "").slice(args[0].replace("<#", "").indexOf(":") + 1, args[0].replace("<#", "").length - 1);
        if (message.mentions.channels.first() && message.mentions.channels.first().id === channelMentionID) {
            const toSay = args.slice(1).join(' ');
            let channel = await message.guild.channels.cache.get(message.mentions.channels.first().id);
            return s(channel, `${toSay.length <= 1995 ? toSay : toSay.substring(0, 1995) + "`...`"}`);
        } else return s(message.channel, `${args.join(' ').length <= 1995 ? args.join(' ') : args.join(' ').substring(0, 1995) + "`...`"}`);
    }
}