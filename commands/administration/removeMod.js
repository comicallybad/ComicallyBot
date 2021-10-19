const { del, findID } = require("../../functions.js");
const db = require('../../schemas/db.js');
const { stripIndents } = require("common-tags");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "removemod",
    aliases: ["rmod", "modremove"],
    category: "administration",
    description: "Remove permitted role/user for mod commands.",
    permissions: "admin",
    usage: "<@user | userID | @role | roleID>",
    run: (client, message, args) => {
        const logChannel = message.guild.channels.cache.find(c => c.name.includes("mod-logs")) || message.channel;
        let guildID = message.guild.id;

        if (!args[0])
            return message.reply("Please provide a user/role.").then(m => del(m, 7500));

        let ID = findID(message, args[0]);

        if (!ID)
            return message.reply("user/role not found").then(m => del(m, 7500));
        else removeMod(ID);

        function removeMod(roleID) {
            db.findOne({
                guildID: guildID,
                modRoles: { $elemMatch: { roleID: roleID } }
            }, (err, exists) => {
                if (err) console.log(err)
                if (exists) {
                    db.updateOne({ guildID: guildID }, {
                        $pull: { modRoles: { roleID: roleID } }
                    }).then(() => {

                        const embed = new MessageEmbed()
                            .setColor("#0efefe")
                            .setTitle("Mod Removed")
                            .setThumbnail(message.author.displayAvatarURL())
                            .setFooter(message.member.displayName, message.author.displayAvatarURL())
                            .setTimestamp()
                            .setDescription(stripIndents`
                            **Mod Removed by:** ${message.member.user}
                            **Role/User ID Removed:** (${roleID})`);

                        logChannel.send(embed).catch(err => err).catch(err => err);

                        return message.reply("Removing mod... this may take a second...").then(m => del(m, 7500));
                    }).catch(err => console.log(err))
                } else return message.reply("user/role was never added, or it was already removed.").then(m => del(m, 7500));
            }).catch(err => console.log(err))
        }
    }
}