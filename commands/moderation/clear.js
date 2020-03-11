const { del } = require("../../functions.js");

module.exports = {
    name: "clear",
    aliases: ["purge", "clean"],
    category: "moderation",
    description: "Clears the chat.",
    permissions: "moderator",
    usage: "[number of messages]",
    run: async (client, message, args) => {
        if (isNaN(args[0]) || parseInt(args[0]) <= 0)
            return message.reply("Please provide a valid number.").then(m => del(m, 7500));

        if (!message.guild.me.hasPermission("MANAGE_MESSAGES"))
            return message.reply("I do not have permissions to delete messages.").then(m => del(m, 7500));

        let deleteAmount;

        if (parseInt(args[0]) > 100) deleteAmount = 100;
        else deleteAmount = parseInt(args[0]);

        message.channel.bulkDelete(deleteAmount, true)
            .catch(err => message.reply(`Something went wrong ${err}`).then(m => del(m, 7500)));
    }
}