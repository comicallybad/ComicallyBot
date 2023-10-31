const { s, r, del } = require("../../../utils/functions/functions.js");
const db = require("../../../utils/schemas/db.js");
const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "removeverificationrole",
    aliases: ["rmverifcationrole", "rmverifyrole"],
    category: "verification",
    description: "Removes verification role to be given after using the verify command.",
    permissions: "moderator",
    usage: "<@role | role ID>",
    run: (client, message, args) => {
        const logChannel = message.guild.channels.cache.find(c => c.name.includes("mod-logs")) || message.channel;
        let guildID = message.guild.id;

        return db.findOne({ guildID: guildID }, (err, exists) => {
            if (!exists) return r(message.channel, message.author, "Role was never added, or it was already removed.").then(m => del(m, 7500));
            exists.verificationRole = [];
            exists.save().catch(err => err);

            const embed = new EmbedBuilder()
                .setColor("#0efefe")
                .setTitle("Verification Role Removed")
                .setThumbnail(message.author.displayAvatarURL())
                .setFooter({ text: message.member.displayName, iconURL: message.author.displayAvatarURL() })
                .setTimestamp()
                .setDescription(`**Verification Role Removed By:** ${message.member.user}`);

            s(logChannel, '', embed);

            return r(message.channel, message.author, "Verification role removed successfully.").then(m => del(m, 7500));
        }).catch(err => err)
    }
}