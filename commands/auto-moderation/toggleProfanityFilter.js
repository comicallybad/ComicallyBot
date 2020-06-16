const { del } = require("../../functions");
const db = require("../../schemas/db.js");

module.exports = {
    name: "toggleprofanityfilter",
    aliases: ["profanitytoggle", "toggleprofanity"],
    category: "auto-moderation",
    description: "Toggles the profanity filter on or off.",
    permissions: "moderator",
    usage: "<true/enable | false/disable>",
    run: (client, message, args) => {
        if (!message.guild.me.hasPermission("MANAGE_MESSAGES"))
            return message.reply("I need `MANAGE_MESSAGES` permissions for the anti-spam system.").then(m => del(m, 7500));

        if (!message.guild.me.hasPermission("MANAGE_ROLES"))
            return message.reply("I need `MANAGE_ROLES` permissions for the anti-spam system.").then(m => del(m, 7500));

        if (!args[0])
            return message.reply("Please provide a true/false or enable/disable.").then(m => del(m, 7500));

        if (args[0] !== "true" && args[0] !== "enable"
            && args[0] !== "false" && args[0] !== "disable") {
            return message.reply("Please provide a true/false or enable/disable.").then(m => del(m, 7500));
        }

        let bool;
        let guildID = message.guild.id;

        if (args[0] === "true" || args[0] === "enable") {
            bool = true;
        } else {
            bool = false;
        }

        db.updateOne({ guildID: guildID }, {
            $set: { profanityFilter: bool }
        }).catch(err => console.log(err))

        return message.reply(`The profanity filter has been toggled to ${args[0]}.`)
    }
}