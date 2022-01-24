const { s, r, e, del, pageList } = require("../../functions.js");
const { MessageEmbed } = require("discord.js");
const db = require('../../schemas/db.js');

module.exports = {
    name: "getmembers",
    aliases: ["members", "listmembers"],
    category: "moderation",
    description: "Get list of permitted role(s)/user(s) for member commands.",
    permissions: "moderator",
    usage: "<@role | role name>",
    run: async (client, message, args) => {
        let guildID = message.guild.id;
        const embed = new MessageEmbed()
            .setColor("#0efefe")
            .setTitle("Server Bot Members")
            .setFooter({ text: message.guild.me.displayName, iconURL: client.user.displayAvatarURL() })
            .setDescription("List of server bot members")
            .setTimestamp();

        const m = await s(message.channel, '', embed);

        db.findOne({ guildID: guildID }, (err, exists) => {
            let memberRoles = exists.memberRoles;
            if (!exists) return r(message.channel, message.author, "Error within database").then(m => del(m, 7500));
            else {
                if (memberRoles.length > 0 && memberRoles.length <= 10) {
                    memberRoles.forEach((role, index) => {
                        embed.addField(`Member: ${index + 1}:`, `Name: \`${role.roleName}\`  ID: \`${role.roleID}\``);
                    });
                    return e(m, m.channel, '', embed).then(del(m, 30000));
                } else if (memberRoles.length > 10) {
                    return pageList(m, message.author, `${memberRoles}`, embed, "Member:")
                } else {
                    embed.setDescription("").addField("Member Roles", "There have been no bot members set.")
                    return e(m, m.channel, '', embed).then(del(m, 30000));
                }
            }
        }).catch(err => console.log(err))
    }
}