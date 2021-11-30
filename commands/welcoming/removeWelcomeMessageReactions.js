const db = require("../../schemas/db.js");
const { s, del } = require("../../functions.js");
const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");

module.exports = {
    name: "removewelcomemessagereactions",
    aliases: ["removewelcomereaction", "removewelcomer", "rmwelcomer"],
    category: "welcoming",
    description: "Removes the reactions to the welcome message sent when a user joins.",
    permissions: "moderator",
    run: async (client, message, args) => {
        let guildID = message.guild.id;
        const logChannel = message.guild.channels.cache.find(c => c.name.includes("mod-logs")) || message.channel;
        db.findOne({ guildID: guildID }, (err, exists) => {
            if (exists) {
                exists.welcomeMessageReactions = [];
            }
            exists.save().catch(err => console.log(err));
        }).catch(err => err);

        const embed = new MessageEmbed()
            .setColor("#0efefe")
            .setTitle("Welcome Message Reaction(s) Removed")
            .setFooter(message.member.displayName, message.author.displayAvatarURL())
            .setTimestamp()
            .setDescription(stripIndents`
            **Welcome message reaction(s) were removed**
            **Welcome message reaction(s) removed by:** ${message.author}`);

        s(logChannel, '', embed).catch(err => err);

        return r(message.channel, message.author, "Welcome reactions removed.").then(m => del(m, 7500));
    }
}