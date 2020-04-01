const { findID, del } = require("../../functions");
const db = require("../../schemas/db.js");

module.exports = {
    name: "reactionroleremove",
    aliases: ["rrremove", "removerr", "rroleremove"],
    category: "helpful",
    description: "Removes a reaction role.",
    permissions: "moderator",
    usage: "<messageID> <roleID|@role>",
    run: async (client, message, args) => {
        if (!args[0])
            return message.reply("Please provide a message ID.").then(m => del(m, 7500));

        if (isNaN(args[0]))
            return message.reply("Please provide a valid message ID.").then(m => del(m, 7500));

        if (!args[1])
            return message.reply("Please provide a role ID or at mention of the role..").then(m => del(m, 7500));

        let guildID = message.guild.id;
        let messageID = args[0];
        let roleID = findID(message, args[1], "role");

        db.updateOne({ guildID: guildID }, {
            $pull: { reactionRoles: { messageID: messageID, roleID: roleID } }
        }).catch(err => console.log(err))

        return message.reply("Removing reaction role if it exists.").then(m => del(m, 7500));
    }
}