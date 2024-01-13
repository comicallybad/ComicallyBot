const { s, del } = require("../../../utils/functions/functions.js");
const xp = require("../../../utils/schemas/xp.js");

module.exports = {
    name: "xpclean",
    category: "owner",
    description: "Cleans XP database from unused users.",
    permissions: "admin",
    run: async (client, message, args) => {
        if (message.author.id != process.env.USERID)
            return s(message.channel, "You're not the bot the owner!").then(m => del(m, 7500));

        return xp.deleteMany({ level: 0, xp: 0 })
            .catch(err => s(message.channel, `There was an error deleting unused XP documents ${err}.`).then(m => del(m, 7500)))
            .then(() => s(message.channel, "XP database has been cleaned up.").then(m => del(m, 7500)));
    }
}