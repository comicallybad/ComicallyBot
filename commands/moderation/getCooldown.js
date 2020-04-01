const { findID, del } = require("../../functions.js");

module.exports = {
    name: "getcooldown",
    aliases: ["cd", "cooldown", "getcd"],
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
            return message.reply("User is not on cooldown.").then(m => del(m, 7500))

        let cooldownTime = Math.pow(5, userCooldowns[userCooldowns.findIndex(usr => usr.userID == userID && usr.guildID == message.guild.id)].offences);

        if (cooldownTime > 120) {
            return message.reply(`User is on cooldown for: \`${Math.floor(cooldownTime / 60)}\` minutes`).then(m => del(m, 7500));
        } else {
            return message.reply(`User is on cooldown for: \`${cooldownTime}\` seconds`).then(m => del(m, 7500));
        }
    }
}