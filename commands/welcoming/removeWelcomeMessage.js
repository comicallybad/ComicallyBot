const db = require("../../schemas/db.js");
const { del } = require("../../functions.js")

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

                    logChannel.send(embed);
                    return message.reply("Removed welcome message.").then(m => del(m, 7500));
                }
            } else return message.reply("There has been no welcome message set.").then(m => del(m, 7500));
        });
    }
}