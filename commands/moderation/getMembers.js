const { RichEmbed } = require("discord.js");
const db = require('../../schemas/db.js');

module.exports = {
    name: "getmembers",
    aliases: ["members", "listmembers"],
    category: "moderation",
    description: "Add permitted role for mod commands",
    permissions: "moderator",
    usage: "<role name|@role>",
    run: async (client, message, args) => {
        let guildID = message.guild.id;
        const embed = new RichEmbed()
            .setColor("#0efefe")
            .setTitle("Server Bot Members")
            .setFooter(message.guild.me.displayName, client.user.displayAvatarURL)
            .setDescription("List of server bot members")
            .setTimestamp();

        const m = await message.channel.send(embed);

        if (message.deletable) message.delete();

        db.findOne({
            guildID: guildID,
        }, (err, exists) => {
            if (err) console.log(err)
            if (!exists) return message.reply("Error within database").then(m => m.delete(7500))
            else {
                let memberRoles = exists.memberRoles.map(role => " Name: " + `\`${role.roleName}\`` + "  ID: " + `\`${role.roleID}\``)
                if (memberRoles.length > 0) {
                    embed.setDescription("").addField("Member Roles", memberRoles);
                    return m.edit(embed).then(m => m.delete(7500));
                } else {
                    embed.setDescription("").addField("Member Roles", "There have been no bot members set.");
                    m.edit(embed).then(m => m.delete(7500));
                }
            }
        }).catch(err => console.log(err))
    }
}