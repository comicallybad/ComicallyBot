const { s, r, del, findID } = require("../../functions.js");
const db = require('../../schemas/db.js');
const { stripIndents } = require("common-tags");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "removemember",
    aliases: ["memberremove", "rmmember"],
    category: "moderation",
    description: "Remove permitted role/user for member commands.",
    permissions: "moderator",
    usage: "<@role | role ID | @user | userID>",
    run: (client, message, args) => {
        const logChannel = message.guild.channels.cache.find(c => c.name.includes("mod-logs")) || message.channel;
        let guildID = message.guild.id;

        if (!args[0])
            return r(message.channel, message.author, "Please provide a user/role.").then(m => del(m, 7500));

        let ID = findID(message, args[0]);

        if (!ID)
            return r(message.channel, message.author, "user/role not found").then(m => del(m, 7500));
        else removeMember(ID);

        function removeMember(roleID) {
            db.findOne({
                guildID: guildID,
                memberRoles: { $elemMatch: { roleID: roleID } }
            }, (err, exists) => {
                if (exists) {
                    db.updateOne({ guildID: guildID }, {
                        $pull: { memberRoles: { roleID: roleID } }
                    }).then(() => {

                        const embed = new MessageEmbed()
                            .setColor("#0efefe")
                            .setTitle("Member Removed")
                            .setThumbnail(message.author.displayAvatarURL())
                            .setFooter({ text: message.member.displayName, iconURL: message.author.displayAvatarURL() })
                            .setTimestamp()
                            .setDescription(stripIndents`
                            **Member Removed by:** ${message.member.user}
                            **Role/User ID Removed:** (${roleID})`);

                        s(logChannel, '', embed);

                        return r(message.channel, message.author, "Removing member... this may take a second...").then(m => del(m, 7500));
                    }).catch(err => console.log(err))
                } else return r(message.channel, message.author, "User/role was never added, or it was already removed.").then(m => del(m, 7500));
            }).catch(err => console.log(err))
        }
    }
}