const { findID, r, del } = require("../../functions");
const db = require("../../schemas/db.js");

module.exports = {
    name: "removereactionrole",
    aliases: ["removerr"],
    category: "reaction-roles",
    description: "Removes a reaction role.",
    permissions: "moderator",
    usage: "<messageID> <@role | roleID>",
    run: async (client, message, args) => {
        if (!args[0])
            return r(message.channel, message.author, "Please provide a message ID.").then(m => del(m, 7500));

        if (isNaN(args[0]))
            return r(message.channel, message.author, "Please provide a valid message ID.").then(m => del(m, 7500));

        if (!args[1])
            return r(message.channel, message.author, "Please provide a role ID or at mention of the role..").then(m => del(m, 7500));

        let guildID = message.guild.id;
        let messageID = args[0];
        let roleID = findID(message, args[1], "role");

        db.updateOne({ guildID: guildID }, {
            $pull: { reactionRoles: { messageID: messageID, roleID: roleID } }
        }).catch(err => console.log(err))

        return r(message.channel, message.author, "Removing reaction role if it exists.").then(m => del(m, 7500));
    }
}