const { MessageEmbed } = require("discord.js");
const db = require('../../schemas/db.js');

module.exports = {
    name: "getmods",
    aliases: ["mods", "listmods", "moderators"],
    category: "administration",
    description: "Add permitted role for mod commands.",
    permissions: "admin",
    usage: "<role name|@role>",
    run: async (client, message, args) => {
        let guildID = message.guild.id;
        const embed = new MessageEmbed()
            .setColor("#0efefe")
            .setTitle("Server Bot Moderators")
            .setFooter(message.guild.me.displayName, client.user.displayAvatarURL())
            .setDescription("List of server bot moderators")
            .setTimestamp();

        const m = await message.channel.send(embed);

        db.findOne({ guildID: guildID, }, (err, exists) => {
            if (err) console.log(err)
            if (!exists) return message.reply("Error within database").then(m => m.delete({ timeout: 7500 }))
            else {
                let modRoles = exists.modRoles.map(role => " Name: " + `\`${role.roleName}\`` + "  ID: " + `\`${role.roleID}\``)
                if (modRoles.length > 0) {
                    embed.setDescription("").addField("Mod Roles", modRoles)
                    return m.edit(embed).then(m => m.delete({ timeout: 30000 }));
                } else {
                    embed.setDescription("").addField("Mod Roles", "There have been no bot mods set.")
                    return m.edit(embed).then(m => m.delete({ timeout: 30000 }));
                }
            }
        }).catch(err => console.log(err))
    }
}