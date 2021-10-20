const { del, findID } = require("../../functions.js");
const db = require('../../schemas/db.js');
const { stripIndents } = require("common-tags");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "addmod",
    aliases: ["amod", "modadd"],
    category: "administration",
    description: "Add permitted role(s)/user(s) for mod commands.",
    permissions: "admin",
    usage: "<@user | userID | @role | roleID>",
    run: (client, message, args) => {
        const logChannel = message.guild.channels.cache.find(c => c.name.includes("mod-logs")) || message.channel;
        let guildID = message.guild.id;

        if (!args[0])
            return message.reply("Please provide a user/role.").then(m => del(m, 7500));

        let roleNames = message.guild.roles.cache.map(role => role.name);
        let roleIDs = message.guild.roles.cache.map(role => role.id);
        let userNames = message.guild.members.cache.map(user => user.user.username);
        let userIDs = message.guild.members.cache.map(user => user.user.id);

        let ID = findID(message, args[0])

        if (!ID)
            return message.reply("user/role not found").then(m => del(m, 7500));

        //if it is a role
        if (roleIDs.includes(ID))
            addMod(roleNames[roleIDs.indexOf(ID)], ID)

        //if it is a user
        if (userIDs.includes(ID))
            addMod(userNames[userIDs.indexOf(ID)], ID)

        function addMod(roleName, roleID) {
            db.findOne({
                guildID: guildID, modRoles: { $elemMatch: { roleName: roleName, roleID: roleID } }
            }, (err, exists) => {
                if (!exists) {
                    db.updateOne({ guildID: guildID }, {
                        $push: { modRoles: { roleName: roleName, roleID: roleID } }
                    }).then(() => {
                        const embed = new MessageEmbed()
                            .setColor("#0efefe")
                            .setTitle("Mod Added")
                            .setThumbnail(message.author.displayAvatarURL())
                            .setFooter(message.member.displayName, message.author.displayAvatarURL())
                            .setTimestamp()
                            .setDescription(stripIndents`
                            **Mod Added by:** ${message.member.user}
                            **Role/User Added:** ${roleName} (${roleID})`);

                        logChannel.send(embed).catch(err => err);

                        return message.reply("Adding mod... this may take a second...").then(m => del(m, 7500));
                    }).catch(err => console.log(err))
                } else return message.reply("user/role already added.").then(m => del(m, 7500));
            }).catch(err => console.log(err))
        }
    }
}