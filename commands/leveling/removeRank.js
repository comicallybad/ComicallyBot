const { s, r, del, findID } = require("../../functions.js");
const db = require("../../schemas/db.js");
const { stripIndents } = require("common-tags");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "removerank",
    aliases: ["rankremove"],
    category: "leveling",
    description: "Removes an assignable rank level role.",
    permissions: "moderator",
    usage: "<@role | roleID>",
    run: async (client, message, args) => {
        if (!args[0])
            return r(message.channel, message.author, "Please provide a role.").then(m => del(m, 7500));

        const logChannel = message.guild.channels.cache.find(c => c.name.includes("mod-logs")) || message.channel;
        const guildID = message.guild.id;
        const roleIDs = message.guild.roles.cache.map(role => role.id);
        const roleNames = message.guild.roles.cache.map(role => role.name);

        let ID = await findID(message, args[0]);
        if (!ID) return r(message.channel, message.author, "Role not found").then(m => del(m, 7500));
        else if (ID) return removeRank(ID);

        if (!isNaN(args[0]))
            removeRank(args[0]);
        else
            return r(message.channel, message.author, "Please provide a valid role, if you are trying to remove a deleted role, use the command with the role ID from the \`_getrr\` command").then(m => del(m, 7500));

        function removeRank(roleID) {
            let roleName = roleNames[roleIDs.indexOf(roleID)]
            return db.findOne({
                guildID: guildID, xpRoles: { $elemMatch: { roleID: roleID } }
            }, (err, exists) => {
                if (!exists) return r(message.channel, message.author, "This rank was never added, or it was removed already.").then(m => del(m, 7500));
                db.updateOne({ guildID: guildID }, {
                    $pull: { xpRoles: { roleID: roleID } }
                }).then(() => {
                    const embed = new MessageEmbed()
                        .setColor("#0efefe")
                        .setTitle("Rank Removed")
                        .setThumbnail(message.author.displayAvatarURL())
                        .setFooter({ text: message.member.displayName, iconURL: message.author.displayAvatarURL() })
                        .setTimestamp()
                        .setDescription(stripIndents`
                        **Rank Removed By:** ${message.member.user}
                        **Rank Removed:** ${roleName} (${roleID})`);

                    s(logChannel, '', embed);

                    return s(message.channel, "Rank removed.").then(m => del(m, 7500));
                }).catch(err => err)
            }).catch(err => err)
        }
    }
}