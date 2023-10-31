const db = require("../../../utils/schemas/db.js");
const { s, r, del } = require("../../../utils/functions/functions.js");
const { EmbedBuilder } = require("discord.js");
const { stripIndents } = require("common-tags");

module.exports = {
    name: "removewelcomemessage",
    aliases: ["removewelcomemsg", "rmwelcomemsg"],
    category: "welcoming",
    description: "Removes the welcome messages sent to new users.",
    permissions: "moderator",
    run: (client, message, args) => {
        return db.findOne({ guildID: message.guild.id }, (err, exists) => {
            if (!exists || !exists.welcomeMessage)
                return r(message.channel, message.author, "There has been no welcome message set.").then(m => del(m, 7500));

            const logChannel = message.guild.channels.cache.find(c => c.name.includes("mod-logs")) || message.channel;
            exists.welcomeMessage = undefined;
            exists.save().catch(err => err);

            const embed = new EmbedBuilder()
                .setColor("#0efefe")
                .setTitle("Welcome Message Removed")
                .setFooter({ text: message.member.displayName, iconURL: message.author.displayAvatarURL() })
                .setTimestamp()
                .setDescription(stripIndents`
                        **Welcome message removed By:** ${message.author}`);

            s(logChannel, '', embed);
            return r(message.channel, message.author, "Removed welcome message.").then(m => del(m, 7500));
        }).catch(err => err);
    }
}