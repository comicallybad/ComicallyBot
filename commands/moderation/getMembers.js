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
            .setFooter(message.guild.me.displayName, client.user.displayAvatarURL())
            .setDescription("List of server bot members")
            .setTimestamp();

        const m = await s(message.channel, '', embed);

        db.findOne({ guildID: guildID }, (err, exists) => {
            if (!exists) return r(message.channel, message.author, "Error within database").then(m => del(m, 7500));
            else {
                let memberRoles = exists.memberRoles.map(role => " Name: " + `\`${role.roleName}\`` + "  ID: " + `\`${role.roleID}\``)
                if (memberRoles.length > 0 && memberRoles.length <= 10) {
                    embed.setDescription("").addField("Member Roles", `${memberRoles}`);
                    return e(m, m.channel, '', embed).then(del(m, 30000));
                } else if (memberRoles.length > 10) {
                    pageList(m, message.author, `${memberRoles}`, embed, "Member:")
                } else {
                    embed.setDescription("").addField("Member Roles", "There have been no bot members set.");
                    return e(m, m.channel, '', embed).then(del(m, 30000));
                }
            }
        }).catch(err => console.log(err))
    }
}