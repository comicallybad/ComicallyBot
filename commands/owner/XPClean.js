const { del } = require("../../functions.js");
const xp = require("../../schemas/xp.js");

module.exports = {
    name: "xpclean",
    aliases: ["xpcleanup"],
    category: "owner",
    description: "Cleans XP database from unused users.",
    permissions: "admin",
    run: (client, message, args) => {
        if (message.author.id != process.env.USERID)
            return message.reply("You're not the bot the owner!").then(m => del(m, 7500));

        xp.deleteMany({ level: 0, xp: 0 })
            .catch(err => message.reply(`There was an error deleting unused XP documents ${err}.`).then(m => del(m, 7500)))
            .then(() => message.reply("XP database has been cleaned up.").then(m => del(m, 7500)))
    }
}