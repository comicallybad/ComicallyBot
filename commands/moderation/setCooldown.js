const { findID, userCooldown, del } = require("../../functions.js");

module.exports = {
    name: "setcooldown",
    aliases: ["setcd", "cooldownset"],
    category: "moderation",
    description: "Gets the cooldown time for a user.",
    permissions: "moderator",
    usage: "<@user|userID> <0-5> Time will be 5^input seconds",
    run: async (client, message, args) => {
        if (!args[0])
            return message.reply("Please provide a user.").then(m => del(m, 7500));

        if (!args[1])
            return message.reply("Please provide an amount 0-5.").then(m => del(m, 7500));

        let offences = Math.floor(parseInt(args[1]))

        if (offences < 0 || offences > 5 || isNaN(args[1]))
            return message.reply("Please provide an amount 0-5.").then(m => del(m, 7500));

        let userID = findID(message, args[0], "user")

        if (!userID)
            return message.reply("Could not find user.").then(m => del(m, 7500));

        userCooldown(message.guild.id, userID, "temp", offences)

        let cooldownTime = Math.pow(5, offences)

        if (cooldownTime > 120) {
            return message.reply(`User is on cooldown for: \`${Math.floor(cooldownTime / 60)}\` minutes`).then(m => del(m, 7500));
        } else {
            return message.reply(`User is on cooldown for: \`${cooldownTime}\` seconds`).then(m => del(m, 7500));
        }
    }
}