const db = require("../../schemas/db.js");

module.exports = {
    name: "removerank",
    aliases: ["rankremove"],
    category: "rank",
    description: "Removes a buyable rank.",
    permissions: "moderator",
    usage: "<@role|roleID>",
    run: (client, message, args) => {
        let guildID = message.guild.id;
        if (message.deletable) message.delete();

        if (!args[0])
            return message.reply("Please provide a role.").then(m => m.delete(7500));

        let roleIDs = message.guild.roles.map(role => role.id);

        let roleMention = args[0].slice(3, args[0].length - 1);


        if (roleIDs.includes(roleMention))
            removeRank(roleMention);

        if (roleIDs.includes(args[0]))
            removeRank(args[0]);

        if (!roleIDs.includes(roleMention) && !roleIDs.includes(args[0]))
            if (!isNaN(args[0]))
                removeRank(args[0]);
            else return message.reply("Please provide a valid role, if you are trying to remove a deleted role, attempt the command again with the role ID from the getroles command").then(m => m.delete(7500))

        function removeRank(roleID) {
            db.findOne({
                guildID: guildID, buyableRanks: { $elemMatch: { roleID: roleID } }
            }, (err, exists) => {
                if (err) console.log(err)
                if (exists) {
                    db.updateOne({ guildID: guildID }, {
                        $pull: { buyableRanks: { roleID: roleID } }
                    }).then(function () {
                        return message.reply("Removing buyable rank... this may take a second...").then(m => m.delete(7500));
                    }).catch(err => console.log(err))
                } if (!exists) return message.reply("This rank was never added, or it was removed already.").then(m => m.delete(7500));
            }).catch(err => console.log(err))
        }
    }
}