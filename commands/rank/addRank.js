const { del, findID } = require("../../functions.js");
const db = require("../../schemas/db.js");
const { stripIndents } = require("common-tags");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "addrank",
    aliases: ["rankadd"],
    category: "rank",
    description: "Adds a rank that can be purchased with coins.",
    permissions: "moderator",
    usage: "<@role|roleID> <cost>",
    run: (client, message, args) => {
        const logChannel = message.guild.channels.cache.find(c => c.name === "mod-logs") || message.channel;
        let guildID = message.guild.id;

        if (!args[0])
            return message.reply("Please provide a role.").then(m => del(m, 7500));

        if (!args[1])
            return message.reply("Please provide a cost.").then(m => del(m, 7500));

        let roleNames = message.guild.roles.cache.map(role => role.name.toLowerCase());
        let roleIDs = message.guild.roles.cache.map(role => role.id);

        let ID = findID(message, args[0], "role");

        if (!ID)
            return message.reply("Role not found").then(m => del(m, 7500));

        if (ID)
            if (isNaN(args[1]) || parseInt(args[1]) <= 0)
                return message.reply("Please provide a valid cost.").then(m => del(m, 7500));
            else addRank(roleNames[roleIDs.indexOf(ID)], ID, parseInt(args[1]));


        function addRank(roleName, roleID, coins) {
            let cost = parseInt(coins);

            db.findOne({
                guildID: guildID, buyableRanks: { $elemMatch: { roleName: roleName, roleID: roleID } }
            }, (err, exists) => {
                if (err) console.log(err)
                if (exists) {
                    db.updateOne({ guildID: guildID, 'buyableRanks.roleID': roleID }, {
                        $set: { 'buyableRanks.$.cost': cost }
                    }).catch(err => console.log(err))
                    return message.reply("Updating buyable rank cost... this may take a second...").then(m => del(m, 7500));
                } if (!exists) {
                    db.updateOne({ guildID: guildID }, {
                        $push: { buyableRanks: { roleName: roleName, roleID: roleID, cost: cost } }
                    }).then(function () {
                        const embed = new MessageEmbed()
                            .setColor("#0efefe")
                            .setThumbnail(message.author.displayAvatarURL())
                            .setFooter(message.member.displayName, message.author.displayAvatarURL())
                            .setTimestamp()
                            .setDescription(stripIndents`**> Role Added by:** ${message.member.user}
                            **> Role Added:** ${roleName} (${roleID})
                            **> Cost:** ${cost}`);

                        logChannel.send(embed);

                        return message.reply("Adding buyable rank... this may take a second...").then(m => del(m, 7500));
                    }).catch(err => console.log(err))
                }
            }).catch(err => console.log(err))
        }
    }
}