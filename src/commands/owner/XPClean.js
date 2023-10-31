const { r, del } = require("../../../utils/functions/functions.js");
const xp = require("../../../utils/schemas/xp.js");

module.exports = {
    name: "xpclean",
    category: "owner",
    description: "Cleans XP database from unused users.",
    permissions: "admin",
    run: async (client, message, args) => {
        if (message.author.id != process.env.USERID)
            return r(message.channel, message.author, "You're not the bot the owner!").then(m => del(m, 7500));

        return xp.deleteMany({ level: 0, xp: 0 })
            .catch(err => r(message.channel, message.author, `There was an error deleting unused XP documents ${err}.`).then(m => del(m, 7500)))
            .then(() => r(message.channel, message.author, "XP database has been cleaned up.").then(m => del(m, 7500)));
    }
}