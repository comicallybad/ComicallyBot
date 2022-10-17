const { r, del } = require("../../functions.js");
const db = require('../../schemas/db.js');

module.exports = {
    name: "getwelcomereactions",
    aliases: ["welcomereactions"],
    category: "welcoming",
    description: "Get's the current welcome message reactions.",
    permissions: "moderator",
    run: (client, message, args) => {
        let guildID = message.guild.id;

        return db.findOne({ guildID: guildID }, async (err, exists) => {
            if (!exists) return;
            if (!(exists.welcomeMessageReactions.length > 0))
                return r(message.channel, message.author, "Welcome message reactions have not been set.").then(m => del(m, 7500))
            let reactions = exists.welcomeMessageReactions.toString();
            return r(message.channel, message.author, reactions).then(m => del(m, 30000));
        }).catch(err => err);
    }
}