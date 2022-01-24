const db = require("../../schemas/db.js");
const { s, r, del } = require("../../functions.js");
const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");

module.exports = {
    name: "removewelcomechannel",
    aliases: ["removewelcomech", "rwelcomech"],
    category: "welcoming",
    description: "Removes the channel where the welcome messages will be sent for new users.",
    permissions: "moderator",
    run: (client, message, args) => {
        db.findOne({ guildID: message.guild.id, channels: { $elemMatch: { command: "welcome" } } }, (err, exists) => {
            if (exists) {
                db.updateOne({ guildID: message.guild.id, 'channels.command': "welcome" }, {
                    $pull: { channels: { command: "welcome" } }
                }).catch(err => console.log(err));
                const embed = new MessageEmbed()
                    .setColor("#0efefe")
                    .setTitle("Welcome Channel Removed")
                    .setFooter({ text: message.member.displayName, iconURL: message.author.displayAvatarURL() })
                    .setTimestamp()
                    .setDescription(stripIndents`
                    **Welcome channel removed by:** ${message.author}`);

                s(logChannel, '', embed);
                return r(message.channel, message.author, "Removed welcome channel.").then(m => del(m, 7500));
            } else return r(message.channel, message.author, "There has been no welcome channel set.").then(m => del(m, 7500));
        });
    }
}