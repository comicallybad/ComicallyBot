const { del, pageList } = require("../../functions.js");
const { MessageEmbed } = require("discord.js");
const db = require('../../schemas/db.js');

module.exports = {
    name: "getverificationrole",
    aliases: ["getverifyrole"],
    category: "verification",
    description: "Add permitted role for mod commands.",
    permissions: "moderator",
    usage: "<@role | role name>",
    run: async (client, message, args) => {
        let guildID = message.guild.id;
        const embed = new MessageEmbed()
            .setColor("#0efefe")
            .setTitle("Verification Role")
            .setFooter(message.guild.me.displayName, client.user.displayAvatarURL())
            .setDescription("Verification Role")
            .setTimestamp();

        const m = await message.channel.send(embed);

        db.findOne({ guildID: guildID }, (err, exists) => {
            if (!exists) return message.reply("Error within database").then(m => del(m, 7500));
            else {
                if (exists.verificationRole.length > 0) {
                    let verificationRole = ` Name: ${exists.verificationRole[0].roleName} ID: ${exists.verificationRole[0].roleID}`;
                    embed.setDescription("").addField("Verification Role", verificationRole);
                    return m.edit(embed).then(del(m, 30000));
                } else {
                    embed.setDescription("No verification role set");
                    return m.edit(embed).then(del(m, 30000));
                }
            }
        }).catch(err => console.log(err))
    }
}