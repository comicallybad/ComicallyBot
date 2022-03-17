const { r, del } = require("../../functions.js");

module.exports = {
    name: "messageowners",
    aliases: ["msgowners"],
    category: "owner",
    description: "Message all guild owners who have the bot in their server for updates/release notes.",
    permissions: "owner",
    run: (client, message, args) => {
        if (message.author.id != process.env.USERID)
            return r(message.channel, message.author, "You're not the bot the owner!").then(m => del(m, 7500));

        client.guilds.cache.map((guild) => {
            client.users.fetch(guild.ownerId).then(u => {
                u.send({ content: `${args.join(' ')}` }).catch(err => err) //Ignore error for if owner has DM's closed
            });
        });
        return r(message.channel, message.author, "Message has been sent to all discord owners using ComicallyBot.").then(m => del(m, 7500));
    }
}