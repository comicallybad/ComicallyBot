const { s, del, findID } = require("../../functions.js");
const db = require('../../schemas/db.js');
const { stripIndents } = require("common-tags");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "setverificationrole",
    aliases: ["addverifyrole"],
    category: "verification",
    description: "Adds verification role to be given after using the verify command.",
    permissions: "moderator",
    usage: "<@role | roleID>",
    run: (client, message, args) => {
        const logChannel = message.guild.channels.cache.find(c => c.name.includes("mod-logs")) || message.channel;
        let guildID = message.guild.id;

        if (!args[0])
            return message.reply("Please provide a role.").then(m => del(m, 7500));

        let roleNames = message.guild.roles.cache.map(role => role.name);
        let roleIDs = message.guild.roles.cache.map(role => role.id);

        let ID = findID(message, args[0])

        if (!ID)
            return message.reply("Role not found").then(m => del(m, 7500));

        if (roleIDs.includes(ID))
            addVerificationRole(roleNames[roleIDs.indexOf(ID)], ID)

        function addVerificationRole(roleName, roleID) {
            db.findOne({ guildID: guildID }, (err, exists) => {
                if (exists) {
                    exists.verificationRole = { roleName: roleName, roleID: roleID };
                    exists.save().catch(err => console.log(err));

                    const embed = new MessageEmbed()
                        .setColor("#0efefe")
                        .setTitle("Verification Role Added")
                        .setThumbnail(message.author.displayAvatarURL())
                        .setFooter(message.member.displayName, message.author.displayAvatarURL())
                        .setTimestamp()
                        .setDescription(stripIndents`
                        **Verification Role Added by:** ${message.member.user}
                        **Role Added:** ${roleName} (${roleID})`);

                    s(logChannel, '', embed).catch(err => err);

                    return message.reply("Adding/updating verification role... this may take a second...").then(m => del(m, 7500));
                }
            }).catch(err => console.log(err))
        }
    }
}