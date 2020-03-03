const db = require("../../schemas/db.js");
const { findID } = require("../../functions.js");

const { stripIndents } = require("common-tags");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "removerank",
    aliases: ["rankremove", "delrank"],
    category: "rank",
    description: "Removes a buyable rank.",
    permissions: "moderator",
    usage: "<@role|roleID>",
    run: (client, message, args) => {
        const logChannel = message.guild.channels.cache.find(c => c.name === "mods-log") || message.channel;
        let guildID = message.guild.id;

        if (!args[0])
            return message.reply("Please provide a role.").then(m => m.delete({ timeout: 7500 }));

        let roleIDs = message.guild.roles.cache.map(role => role.id);
        let roleNames = message.guild.roles.cache.map(role => role.name.toLowerCase());


        let ID = findID(message, args[0], "role");

        if (ID)
            removeRank(ID);

        if (!ID)
            if (!isNaN(args[0]))
                removeRank(args[0]);
            else
                return message.reply("Please provide a valid role, if you are trying to remove a deleted role, attempt the command again with the role ID from the getroles command").then(m => m.delete({ timeout: 7500 }));

        function removeRank(roleID) {
            let roleName = roleNames[roleIDs.indexOf(roleID)]
            db.findOne({
                guildID: guildID, buyableRanks: { $elemMatch: { roleID: roleID } }
            }, (err, exists) => {
                if (err) console.log(err)
                if (exists) {
                    db.updateOne({ guildID: guildID }, {
                        $pull: { buyableRanks: { roleID: roleID } }
                    }).then(function () {
                        const embed = new MessageEmbed()
                            .setColor("#0efefe")
                            .setThumbnail(message.author.displayAvatarURL())
                            .setFooter(message.member.displayName, message.author.displayAvatarURL())
                            .setTimestamp()
                            .setDescription(stripIndents`**> Role Removed by:** ${message.member.user.username} (${message.member.id})
                            **> Role Removed:** ${roleName} (${roleID})`);

                        logChannel.send(embed);

                        return message.reply("Removing buyable rank... this may take a second...").then(m => m.delete({ timeout: 7500 }));
                    }).catch(err => console.log(err))
                } if (!exists) return message.reply("This rank was never added, or it was removed already.").then(m => m.delete({ timeout: 7500 }));
            }).catch(err => console.log(err))
        }
    }
}