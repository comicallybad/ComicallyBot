const { s, r, del, findID } = require("../../functions.js");
const db = require('../../schemas/db.js');
const { stripIndents } = require("common-tags");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "addmember",
    aliases: ["memberadd"],
    category: "moderation",
    description: "Add permitted member/role for member commands.",
    permissions: "moderator",
    usage: "<@user | userID | @role | roleID>",
    run: async (client, message, args) => {
        if (!args[0])
            return r(message.channel, message.author, "Please provide a member/role.").then(m => del(m, 7500));

        let ID = await findID(message, args[0]);
        if (!ID) return r(message.channel, message.author, "Member/role not found.").then(m => del(m, 7500));

        const logChannel = message.guild.channels.cache.find(c => c.name.includes("mod-logs")) || message.channel;
        let guildID = message.guild.id;
        let roleNames = message.guild.roles.cache.map(role => role.name);
        let roleIDs = message.guild.roles.cache.map(role => role.id);
        let userNames = message.guild.members.cache.map(user => user.user.username);
        let userIDs = message.guild.members.cache.map(user => user.user.id);

        //if it is a role
        if (roleIDs.includes(ID))
            return addMember(roleNames[roleIDs.indexOf(ID)], ID);

        //if it is a user
        if (userIDs.includes(ID))
            return addMember(userNames[userIDs.indexOf(ID)], ID);

        function addMember(roleName, roleID) {
            return db.findOne({
                guildID: guildID,
                memberRoles: { $elemMatch: { roleName: roleName, roleID: roleID } }
            }, (err, exists) => {
                if (exists) return s(message.channel, "Member/role already added.").then(m => del(m, 7500));
                db.updateOne({ guildID: guildID }, {
                    $push: { memberRoles: { roleName: roleName, roleID: roleID } }
                }).then(() => {
                    const embed = new MessageEmbed()
                        .setColor("#0efefe")
                        .setTitle("Member Added")
                        .setThumbnail(message.author.displayAvatarURL())
                        .setFooter({ text: message.member.displayName, iconURL: message.author.displayAvatarURL() })
                        .setTimestamp()
                        .setDescription(stripIndents`
                        **Member Added By:** ${message.member.user}
                        **Role/member Added:** ${roleName} (${roleID})`);

                    s(logChannel, '', embed);

                    return s(message.channel, "Member added.").then(m => del(m, 7500));
                }).catch(err => r(message.channel, message.author, `There was an error adding this member: ${err}`).then(m => del(m, 7500)));
            }).catch(err => err);
        }
    }
}