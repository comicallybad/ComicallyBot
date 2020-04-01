const { findID, del } = require("../../functions.js");

module.exports = {
    name: "clearcooldown",
    aliases: ["ccd", "clearcd", "cooldownclear"],
    category: "moderation",
    description: "Gets the cooldown time for a user.",
    permissions: "moderator",
    usage: "<@user|userID>",
    run: async (client, message, args) => {
        if (!args[0])
            return message.reply("Please provide a user.").then(m => del(m, 7500));

        let userID = findID(message, args[0], "user")

        if (!userID)
            return message.reply("Could not find user.").then(m => del(m, 7500));

        if (!userCooldowns[userCooldowns.findIndex(usr => usr.userID == userID && usr.guildID == message.guild.id)])
            return message.reply("User does not have a cooldown.").then(m => del(m, 7500));
        else {
            userCooldowns.splice(userCooldowns.findIndex(usr => usr.userID === userID && usr.guildID == message.guild.id), 1);
            return message.reply("User cooldown has been cleared.").then(m => del(m, 7500));
        }
    }
}