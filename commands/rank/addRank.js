const db = require("../../schemas/db.js");

module.exports = {
    name: "addrank",
    aliases: ["rankadd"],
    category: "coins",
    description: "Adds a rank that can be purchased with coins.",
    permissions: "moderator",
    usage: "<@role|roleID> <cost>",
    run: (client, message, args) => {
        let guildID = message.guild.id;
        if (message.deletable) message.delete();

        if (!args[0])
            return message.reply("Please provide a role.").then(m => m.delete(7500));

        if (!args[1])
            return message.reply("Please provide a cost.").then(m => m.delete(7500));

        let roleNames = message.guild.roles.map(role => role.name.toLowerCase());
        let roleIDs = message.guild.roles.map(role => role.id);

        let roleMention = args[0].slice(3, args[0].length - 1);

        if (!roleIDs.includes(roleMention) && !roleIDs.includes(args[0]))
            return message.reply("Role not found.").then(m => m.delete(7500));

        if (isNaN(args[1]))
            return message.reply("Please provide a number cost.")

        if (roleIDs.includes(roleMention))
            addRank(roleNames[roleIDs.indexOf(roleMention)], roleMention, args[1]);

        if (roleIDs.includes(args[0]))
            addRank(roleNames[roleIDs.indexOf(args[0])], args[0], args[1]);

        function addRank(roleName, roleID, coins) {
            let cost = parseInt(coins)

            db.findOne({
                guildID: guildID, buyableRanks: { $elemMatch: { roleName: roleName, roleID: roleID } }
            }, (err, exists) => {
                if (err) console.log(err)
                if (exists) {
                    db.updateOne({ guildID: guildID, 'buyableRanks.roleID': roleID }, {
                        $set: { 'buyableRanks.$.cost': cost }
                    }).catch(err => console.log(err))
                    return message.reply("Updating buyable rank cost... this may take a second...").then(m => m.delete(7500));
                } if (!exists) {
                    db.updateOne({ guildID: guildID }, {
                        $push: { buyableRanks: { roleName: roleName, roleID: roleID, cost: cost } }
                    }).then(function () {
                        return message.reply("Adding buyable rank... this may take a second...").then(m => m.delete(7500));
                    }).catch(err => console.log(err))
                }
            }).catch(err => console.log(err))
        }
    }
}