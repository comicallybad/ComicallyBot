const db = require("../../../utils/schemas/db.js");
const { s, r, del } = require("../../../utils/functions/functions.js");
const { EmbedBuilder } = require("discord.js");
const { stripIndents } = require("common-tags");

module.exports = {
    name: "removewelcomechannel",
    aliases: ["removewelcomech", "rmwelcomech"],
    category: "welcoming",
    description: "Removes the channel where the welcome messages will be sent for new users.",
    permissions: "moderator",
    run: (client, message, args) => {
        return db.findOne({ guildID: message.guild.id, channels: { $elemMatch: { command: "welcome" } } }, (err, exists) => {
            if (!exists) return r(message.channel, message.author, "There has been no welcome channel set.").then(m => del(m, 7500));
            const logChannel = message.guild.channels.cache.find(c => c.name.includes("mod-logs")) || message.channel;
            db.updateOne({ guildID: message.guild.id, 'channels.command': "welcome" }, {
                $pull: { channels: { command: "welcome" } }
            }).catch(err => err);
            const embed = new EmbedBuilder()
                .setColor("#0efefe")
                .setTitle("Welcome Channel Removed")
                .setFooter({ text: message.member.displayName, iconURL: message.author.displayAvatarURL() })
                .setTimestamp()
                .setDescription(stripIndents`
                    **Welcome channel removed By:** ${message.author}`);

            s(logChannel, '', embed);
            return r(message.channel, message.author, "Removed welcome channel.").then(m => del(m, 7500));
        }).catch(err => err);
    }
}