const { del, findID } = require("../../functions.js");
const db = require('../../schemas/db.js');
const { stripIndents } = require("common-tags");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "removemember",
    aliases: ["rmember", "memberremove"],
    category: "moderation",
    description: "Add permitted role/user for member commands.",
    permissions: "moderator",
    usage: "<@role|role ID|@user|userID>",
    run: (client, message, args) => {
        const logChannel = message.guild.channels.cache.find(c => c.name === "mod-logs") || message.channel;
        let guildID = message.guild.id;

        if (!args[0])
            return message.reply("Please provide a user/role.").then(m => del(m, 7500));

        let ID = findID(message, args[0]);

        if (!ID)
            return message.reply("user/role not found").then(m => del(m, 7500));
        else removeMember(ID);

        function removeMember(roleID) {
            db.findOne({
                guildID: guildID,
                memberRoles: { $elemMatch: { roleID: roleID } }
            }, (err, exists) => {
                if (err) console.log(err)
                if (exists) {
                    db.updateOne({ guildID: guildID }, {
                        $pull: { memberRoles: { roleID: roleID } }
                    }).then(function () {

                        const embed = new MessageEmbed()
                            .setColor("#0efefe")
                            .setThumbnail(message.author.displayAvatarURL())
                            .setFooter(message.member.displayName, message.author.displayAvatarURL())
                            .setTimestamp()
                            .setDescription(stripIndents`
                            **Member Removed by: ${message.member.user}**
                            **Role/User ID Removed: (${roleID}**`);

                        logChannel.send(embed);

                        return message.reply("Removing member... this may take a second...").then(m => del(m, 7500));
                    }).catch(err => console.log(err))
                } else return message.reply("user/role was never added, or it was already removed.").then(m => del(m, 7500));
            }).catch(err => console.log(err))
        }
    }
}