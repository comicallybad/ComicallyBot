const { s, r, del, findID } = require("../../functions.js");
const db = require('../../schemas/db.js');
const { stripIndents } = require("common-tags");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "addmod",
    aliases: ["modadd"],
    category: "administration",
    description: "Add permitted role(s)/user(s) for mod commands.",
    permissions: "admin",
    usage: "<@user | userID | @role | roleID>",
    run: async (client, message, args) => {
        if (!args[0])
            return r(message.channel, message.author, "Please provide a user/role.").then(m => del(m, 7500));

        const logChannel = message.guild.channels.cache.find(c => c.name.includes("mod-logs")) || message.channel;
        let guildID = message.guild.id;
        let roleNames = message.guild.roles.cache.map(role => role.name);
        let roleIDs = message.guild.roles.cache.map(role => role.id);
        let userNames = message.guild.members.cache.map(user => user.user.username);
        let userIDs = message.guild.members.cache.map(user => user.user.id);

        let ID = await findID(message, args[0]);
        if (!ID) return r(message.channel, message.author, "user/role not found.").then(m => del(m, 7500));

        //if it is a role
        if (roleIDs.includes(ID))
            return addMod(roleNames[roleIDs.indexOf(ID)], ID)

        //if it is a user
        if (userIDs.includes(ID))
            return addMod(userNames[userIDs.indexOf(ID)], ID)

        function addMod(roleName, roleID) {
            return db.findOne({
                guildID: guildID, modRoles: { $elemMatch: { roleName: roleName, roleID: roleID } }
            }, (err, exists) => {
                if (exists) return s(message.channel, "User/role already added.").then(m => del(m, 7500));
                db.updateOne({ guildID: guildID }, {
                    $push: { modRoles: { roleName: roleName, roleID: roleID } }
                }).then(() => {
                    const embed = new MessageEmbed()
                        .setColor("#0efefe")
                        .setTitle("Mod Added")
                        .setThumbnail(message.author.displayAvatarURL())
                        .setFooter({ text: message.member.displayName, iconURL: message.author.displayAvatarURL() })
                        .setTimestamp()
                        .setDescription(stripIndents`
                        **Mod Added By:** ${message.member.user}
                        **Role/User Added:** ${roleName} (${roleID})`);

                    s(logChannel, '', embed);

                    return s(message.channel, "Mod added.").then(m => del(m, 7500));
                }).catch(err => r(message.channel, message.author, `There was an error adding this mod: ${err}`).then(m => del(m, 7500)));
            }).catch(err => err);
        }
    }
}