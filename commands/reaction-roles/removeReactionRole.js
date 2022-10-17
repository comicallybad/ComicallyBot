const { findID, r, del, s } = require("../../functions");
const db = require("../../schemas/db.js");
const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");

module.exports = {
    name: "removereactionrole",
    aliases: ["reactionroleremove", "removerr"],
    category: "reaction-roles",
    description: "Removes a reaction role.",
    permissions: "moderator",
    usage: "<messageID> <@role | roleID>",
    run: async (client, message, args) => {
        if (!args[0])
            return r(message.channel, message.author, "Please provide a message ID.").then(m => del(m, 7500));

        if (isNaN(args[0]))
            return r(message.channel, message.author, "Please provide a valid message ID.").then(m => del(m, 7500));

        if (!args[1])
            return r(message.channel, message.author, "Please provide a role ID or at mention of the role..").then(m => del(m, 7500));

        const logChannel = message.guild.channels.cache.find(c => c.name.includes("mod-logs")) || message.channel;
        const guildID = message.guild.id;
        const messageID = args[0];
        let roleID = await findID(message, args[1]);
        const role = message.guild.roles.cache.find(r => r.id == roleID);

        return db.updateOne({ guildID: guildID }, {
            $pull: { reactionRoles: { messageID: messageID, roleID: roleID } }
        }).then(() => {
            const embed = new MessageEmbed()
                .setColor("#0efefe")
                .setTitle("Reaction Role Revmoed")
                .setThumbnail(message.author.displayAvatarURL())
                .setDescription(stripIndents`
                **Reaction Role Removed By:** ${message.member.user}
                **Reaction Role:** ${role}(${role.id})
                **Reaction Role Messasge ID:** ${messageID}`)
                .setFooter({ text: message.member.displayName, iconURL: message.author.displayAvatarURL() })
                .setTimestamp();

            s(message.channel, "Reaction Role removed.").then(m => del(m, 7500));
            return s(logChannel, '', embed);
        }).catch(err => r(message.channel, message.author, `There was an error removing this reaction role: ${err}`).then(m => del(m, 7500)));
    }
}