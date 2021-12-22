const { s, del, findID } = require("../../functions.js");
const db = require('../../schemas/db.js');
const { stripIndents } = require("common-tags");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "addmember",
    category: "moderation",
    description: "Add permitted role/user for member commands.",
    permissions: "moderator",
    usage: "<@role | roleID | @user | userID>",
    run: (client, message, args) => {
        const logChannel = message.guild.channels.cache.find(c => c.name.includes("mod-logs")) || message.channel;
        let guildID = message.guild.id;

        if (!args[0])
            return r(message.channel, message.author, "Please provide a user/role.").then(m => del(m, 7500));

        let roleNames = message.guild.roles.cache.map(role => role.name);
        let roleIDs = message.guild.roles.cache.map(role => role.id);
        let userNames = message.guild.members.cache.map(user => user.user.username);
        let userIDs = message.guild.members.cache.map(user => user.user.id);

        let ID = findID(message, args[0])

        if (!ID)
            return r(message.channel, message.author, "user/role not found").then(m => del(m, 7500));

        //if it is a role
        if (roleIDs.includes(ID))
            addMember(roleNames[roleIDs.indexOf(ID)], ID)

        //if it is a user
        if (userIDs.includes(ID))
            addMember(userNames[userIDs.indexOf(ID)], ID)

        function addMember(roleName, roleID) {
            db.findOne({
                guildID: guildID,
                memberRoles: { $elemMatch: { roleName: roleName, roleID: roleID } }
            }, (err, exists) => {
                if (!exists) {
                    db.updateOne({ guildID: guildID }, {
                        $push: { memberRoles: { roleName: roleName, roleID: roleID } }
                    }).then(() => {

                        const embed = new MessageEmbed()
                            .setColor("#0efefe")
                            .setTitle("Member Added")
                            .setThumbnail(message.author.displayAvatarURL())
                            .setFooter(message.member.displayName, message.author.displayAvatarURL())
                            .setTimestamp()
                            .setDescription(stripIndents`
                            **Member Added by:** ${message.member.user}
                            **Role/User Added:** ${roleName} (${roleID})`);

                        s(logChannel, '', embed);

                        return r(message.channel, message.author, "Adding member... this may take a second...").then(m => del(m, 7500));
                    }).catch(err => console.log(err))
                } else return r(message.channel, message.author, "User/role already added.").then(m => del(m, 7500));
            }).catch(err => console.log(err))
        }
    }
}