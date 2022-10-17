const { s, r, del, findID } = require("../../functions.js");
const db = require('../../schemas/db.js');
const { stripIndents } = require("common-tags");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "removemember",
    aliases: ["rmmember"],
    category: "moderation",
    description: "Remove permitted member/role for member commands.",
    permissions: "moderator",
    usage: "<@user | userID | @role | roleID>",
    run: async (client, message, args) => {
        const logChannel = message.guild.channels.cache.find(c => c.name.includes("mod-logs")) || message.channel;
        let guildID = message.guild.id;

        if (!args[0])
            return r(message.channel, message.author, "Please provide a member/role.").then(m => del(m, 7500));

        let ID = await findID(message, args[0]);
        if (!ID) return r(message.channel, message.author, "Member/role not found.").then(m => del(m, 7500));
        else return removeMember(ID);

        function removeMember(roleID) {
            return db.findOne({
                guildID: guildID,
                memberRoles: { $elemMatch: { roleID: roleID } }
            }, (err, exists) => {
                if (!exists)
                    return s(message.channel, "Member/role was never added, or it was already removed.").then(m => del(m, 7500));
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
                            **Member Removed By:** ${message.member.user}
                            **Role/Member ID Removed:** (${roleID})`);

                    s(logChannel, '', embed);

                    return s(message.channel, "Member removed.").then(m => del(m, 7500));
                }).catch(err => r(message.channel, message.author, `There was an error removing this member: ${err}`).then(m => del(m, 7500)));
            }).catch(err => err);
        }
    }
}