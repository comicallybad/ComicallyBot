const db = require('../../schemas/db.js');

module.exports = {
    name: "removemember",
    aliases: ["rmember", "memberremove"],
    category: "moderation",
    description: "Add permitted role/user for member commands",
    permissions: "moderator",
    usage: "<@role|role ID|@user|userID>",
    run: (client, message, args) => {
        let guildID = message.guild.id;
        if (message.deletable) message.delete();

        if (!args[0])
            return message.reply("Please provide a user/role.").then(m => m.delete(7500));

        let roleIDs = message.guild.roles.map(role => role.id);
        let userIDs = message.guild.members.map(role => role.user.id);

        let channelMention = args[0].slice(3, args[0].length - 1);
        let userMention = args[0].slice(2, args[0].length - 1)

        if (!roleIDs.includes(channelMention) && !roleIDs.includes(args[0])
            && !userIDs.includes(userMention) && !userIDs.includes(args[0]))
            if (!isNaN(args[0]))
                removeMember(args[0]);
            else return message.reply("user/role not found. If you are trying to remove someone not in the server, use their ID from getmembers.").then(m => m.delete(7500));

        if (roleIDs.includes(channelMention))
            removeMember(channelMention);

        if (roleIDs.includes(args[0]))
            removeMember(args[0])

        if (userIDs.includes(args[0]))
            removeMember(args[0])

        if (userIDs.includes(userMention))
            removeMember(userMention)

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
                        return message.reply("Removing member... this may take a second...").then(m => m.delete(7500));
                    }).catch(err => console.log(err))
                } else return message.reply("user/role was never added, or it was already removed.").then(m => m.delete(7500));
            }).catch(err => console.log(err))
        }
    }
}