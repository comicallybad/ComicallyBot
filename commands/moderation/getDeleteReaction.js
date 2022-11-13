const { s, del } = require("../../functions.js");
const db = require("../../schemas/db.js");

module.exports = {
    name: "getdeletereaction",
    aliases: ["getdelreaction", "delreaction"],
    category: "moderation",
    description: "Shows the current delete reaction emoji.",
    permissions: "moderator",
    run: async (client, message, args) => {
        let exists = await db.findOne({ guildID: message.guild.id }).catch(err => err);
        if (!exists || !exists.deleteReaction)
            return s(message.channel, "A delete reaction emoji has not been set.").then(m => del(m, 7500));
        const reaction = exists.deleteReaction;

        return s(message.channel, `The current delete reaction has been set to: ${reaction.length == 1 ? reaction : message.guild.emojis.cache.get(reaction)}`).then(m => del(m, 15000));
    }
}