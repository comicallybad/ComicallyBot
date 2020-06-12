const { del } = require("../../functions");

module.exports = {
    name: "say",
    aliases: ["send", "message"],
    category: "helpful",
    description: "Makes the bot say something.",
    permissions: "moderator",
    run: async (client, message, args) => {
        if (!args[0]) {
            return message.reply("Please provide something to say.").then(m => del(m, 7500))
        } else {
            message.channel.send(args.join(' '));
        }
    }
}