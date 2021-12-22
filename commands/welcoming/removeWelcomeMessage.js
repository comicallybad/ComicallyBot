const db = require("../../schemas/db.js");
const { s, del } = require("../../functions.js");
const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");

module.exports = {
    name: "removewelcomeMessage",
    aliases: ["removewelcomemsg", "rwelcomemsg"],
    category: "welcoming",
    description: "Removes the welcome messages sent to new users.",
    permissions: "moderator",
    run: (client, message, args) => {
        db.findOne({ guildID: message.guild.id }, (err, exists) => {
            if (exists) {
                if (exists.welcomeMessage) {
                    exists.welcomeMessage = undefined;
                    exists.save().catch(err => err);

                    const embed = new MessageEmbed()
                        .setColor("#0efefe")
                        .setTitle("Welcome Message Removed")
                        .setFooter(message.member.displayName, message.author.displayAvatarURL())
                        .setTimestamp()
                        .setDescription(stripIndents`
                        **Welcome message removed by:** ${message.author}`);

                    s(logChannel, '', embed);
                    return r(message.channel, message.author, "Removed welcome message.").then(m => del(m, 7500));
                }
            } else return r(message.channel, message.author, "There has been no welcome message set.").then(m => del(m, 7500));
        });
    }
}