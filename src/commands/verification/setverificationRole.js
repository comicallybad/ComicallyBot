const { s, r, del, findID } = require("../../../utils/functions/functions.js");
const db = require("../../../utils/schemas/db.js");
const { stripIndents } = require("common-tags");
const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "setverificationrole",
    aliases: ["setverifyrole", "addverifyrole"],
    category: "verification",
    description: "Adds verification role to be given after using the verify command.",
    permissions: "moderator",
    usage: "<@role | roleID>",
    run: async (client, message, args) => {
        if (!args[0])
            return r(message.channel, message.author, "Please provide a role.").then(m => del(m, 7500));

        const logChannel = message.guild.channels.cache.find(c => c.name.includes("mod-logs")) || message.channel;
        let guildID = message.guild.id;
        let roleNames = message.guild.roles.cache.map(role => role.name);
        let roleIDs = message.guild.roles.cache.map(role => role.id);

        let ID = await findID(message, args[0])
        if (!ID) return r(message.channel, message.author, "Role not found").then(m => del(m, 7500));

        if (roleIDs.includes(ID))
            return addVerificationRole(roleNames[roleIDs.indexOf(ID)], ID)

        function addVerificationRole(roleName, roleID) {
            return db.findOne({ guildID: guildID }, (err, exists) => {
                if (!exists) return;
                exists.verificationRole = { roleName: roleName, roleID: roleID };
                exists.save().catch(err => err);

                const embed = new EmbedBuilder()
                    .setColor("#0efefe")
                    .setTitle("Verification Role Added")
                    .setThumbnail(message.author.displayAvatarURL())
                    .setFooter({ text: message.member.displayName, iconURL: message.author.displayAvatarURL() })
                    .setTimestamp()
                    .setDescription(stripIndents`
                    **Verification Role Added By:** ${message.member.user}
                    **Role Added:** ${roleName} (${roleID})`);

                s(logChannel, '', embed);

                return r(message.channel, message.author, "Verification Role Has been set.").then(m => del(m, 7500));
            }).catch(err => err);
        }
    }
}