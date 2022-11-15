const { s, del } = require("../../functions.js");
const { MessageEmbed } = require("discord.js");
const db = require("../../schemas/db.js");

module.exports = {
    name: "removedeletereaction",
    aliases: ["removedelreaction", "rmdelreaction"],
    category: "moderation",
    description: "Removes the delete reaction emoji.",
    permissions: "moderator",
    run: async (client, message, args) => {
        let exists = await db.findOne({ guildID: message.guild.id }).catch(err => err);
        if (!exists || !exists.deleteReaction)
            return s(message.channel, "A delete reaction emoji has not been set.").then(m => del(m, 7500));

        exists.deleteReaction = undefined;
        exists.save();

        const logChannel = message.guild.channels.cache.find(c => c.name.includes("mod-logs")) || message.channel;
        const embed = new MessageEmbed()
            .setTitle("Delete Reaction Removed")
            .setColor("#0efefe")
            .setThumbnail(message.member.user.displayAvatarURL())
            .setFooter({ text: message.member.displayName, iconURL: message.author.displayAvatarURL() })
            .setTimestamp()
            .setDescription(`**Delete Reaction Removed By:** ${message.member}`);

        s(message.channel, "Delete reaction removed.").then(m => del(m, 7500));
        return s(logChannel, '', embed);
    }
}