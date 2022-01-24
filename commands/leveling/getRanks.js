const { s, e, del } = require("../../functions.js");
const db = require("../../schemas/db.js");
const { MessageEmbed } = require("discord.js")

module.exports = {
    name: "getranks",
    aliases: ["ranks", "listranks", "getroles"],
    category: "leveling",
    description: "List of ranks that can be purchased with coins.",
    permissions: "member",
    run: async (client, message, args) => {
        const guildID = message.guild.id;

        const embed = new MessageEmbed()
            .setColor("#0efefe")
            .setTitle("XP Level Ranks")
            .setFooter({ text: message.guild.me.displayName, iconURL: client.user.displayAvatarURL() })
            .setDescription("List of XP Level ranks")
            .setTimestamp();

        const m = await s(message.channel, '', embed);

        db.findOne({ guildID: guildID }, (err, exists) => {
            if (exists.xpRoles.length > 0) {
                let rankList = exists.xpRoles.map(rank => "Name: " + `\`${rank.roleName}\`` + ", ID: " + `\`${rank.roleID}\`` + ", level: " + `\`${rank.level}\``);
                embed.setDescription("").addField("Ranks: ", rankList);
                return e(m, m.channel, '', embed).then(del(m, 30000));
            } else {
                embed.setDescription("").addField("Ranks: ", "There have been no level ranks set");
                return e(m, m.channel, '', embed).then(del(m, 30000));
            }
        }).catch(err => console.log(err))
    }
}
