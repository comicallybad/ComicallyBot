const db = require("../../schemas/db.js");
const { s, r, del } = require("../../functions.js");
const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");

module.exports = {
    name: "removewelcomereactions",
    aliases: ["removewelcomereaction", "rmwelcomereactions", "rmwelcomereaction"],
    category: "welcoming",
    description: "Removes the reactions to the welcome message sent when a user joins.",
    permissions: "moderator",
    run: async (client, message, args) => {
        let guildID = message.guild.id;
        const logChannel = message.guild.channels.cache.find(c => c.name.includes("mod-logs")) || message.channel;

        db.findOne({ guildID: guildID }, (err, exists) => {
            if (exists) exists.welcomeMessageReactions = [];
            exists.save().catch(err => err);
        }).catch(err => err);

        const embed = new MessageEmbed()
            .setColor("#0efefe")
            .setTitle("Welcome Message Reaction(s) Removed")
            .setFooter({ text: message.member.displayName, iconURL: message.author.displayAvatarURL() })
            .setTimestamp()
            .setDescription(stripIndents`
            **Welcome message reaction(s) were removed**
            **Welcome message reaction(s) removed By:** ${message.author}`);

        s(logChannel, '', embed);

        return r(message.channel, message.author, "Welcome reactions removed.").then(m => del(m, 7500));
    }
}