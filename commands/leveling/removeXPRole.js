const { s, r, del, findID } = require("../../functions.js");
const db = require("../../schemas/db.js");
const { stripIndents } = require("common-tags");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "removexprole",
    aliases: ["xproleremove", "removerank"],
    category: "leveling",
    description: "Removes an assignable XP level role.",
    permissions: "moderator",
    usage: "<@role | roleID>",
    run: async (client, message, args) => {
        const logChannel = message.guild.channels.cache.find(c => c.name.includes("mod-logs")) || message.channel;
        let guildID = message.guild.id;

        if (!args[0])
            return r(message.channel, message.author, "Please provide a role.").then(m => del(m, 7500));

        let roleIDs = message.guild.roles.cache.map(role => role.id);
        let roleNames = message.guild.roles.cache.map(role => role.name);


        let ID = await findID(message, args[0], "role");

        if (ID)
            removeRole(ID);

        if (!ID)
            if (!isNaN(args[0]))
                removeRole(args[0]);
            else
                return r(message.channel, message.author, "Please provide a valid role, if you are trying to remove a deleted role, attempt the command again with the role ID from the getroles command").then(m => del(m, 7500));

        function removeRole(roleID) {
            let roleName = roleNames[roleIDs.indexOf(roleID)]
            db.findOne({
                guildID: guildID, xpRoles: { $elemMatch: { roleID: roleID } }
            }, (err, exists) => {
                if (exists) {
                    db.updateOne({ guildID: guildID }, {
                        $pull: { xpRoles: { roleID: roleID } }
                    }).then(() => {
                        const embed = new MessageEmbed()
                            .setColor("#0efefe")
                            .setTitle("XP Role Removed")
                            .setThumbnail(message.author.displayAvatarURL())
                            .setFooter({ text: message.member.displayName, iconURL: message.author.displayAvatarURL() })
                            .setTimestamp()
                            .setDescription(stripIndents`
                            **XP Role Removed By:** ${message.member.user}
                            **XP Role Removed:** ${roleName} (${roleID})`);

                        s(logChannel, '', embed);

                        return r(message.channel, message.author, "Removing XP level role.").then(m => del(m, 7500));
                    }).catch(err => console.log(err))
                } if (!exists) return r(message.channel, message.author, "This role was never added, or it was removed already.").then(m => del(m, 7500));
            }).clone().catch(err => console.log(err))
        }
    }
}