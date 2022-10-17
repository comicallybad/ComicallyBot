const { s, r, e, del, pageList } = require("../../functions.js");
const { MessageEmbed } = require("discord.js");
const db = require('../../schemas/db.js');

module.exports = {
    name: "getmods",
    aliases: ["mods"],
    category: "moderation",
    description: "Add permitted role for mod commands.",
    permissions: "moderator",
    run: async (client, message, args) => {
        let guildID = message.guild.id;
        const embed = new MessageEmbed()
            .setColor("#0efefe")
            .setTitle("Server Bot Moderators")
            .setFooter({ text: message.guild.me.displayName, iconURL: client.user.displayAvatarURL() })
            .setDescription("List of server bot moderators")
            .setTimestamp();

        const m = await s(message.channel, '', embed);

        return db.findOne({ guildID: guildID }, (err, exists) => {
            let modRoles = exists.modRoles;
            if (!exists) return r(message.channel, message.author, "Error within database").then(m => del(m, 7500));
            if (modRoles.length > 0 && modRoles.length <= 10) {
                modRoles.forEach((role, index) => {
                    embed.addField(`Mod: ${index + 1}`, `Name: \`${role.roleName}\`  ID: \`${role.roleID}\``);
                });
                return e(m, m.channel, '', embed).then(del(m, 30000));
            } else if (modRoles.length > 10) {
                return pageList(m, message.author, `${modRoles}`, embed, "Mod:", 10, 0);
            } else {
                embed.setDescription("").addField("Mod Roles", "There have been no bot mods set.");
                return e(m, m.channel, '', embed).then(del(m, 30000));
            }
        }).catch(err => err)
    }
}