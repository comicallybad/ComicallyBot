const { del } = require("../../functions.js");
const db = require('../../schemas/db.js');
const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");

module.exports = {
    name: "setwelcomemessage",
    aliases: ["setwelcomemsg", "swelcomemsg"],
    category: "helpful",
    description: "Set a welcoming message for new users. (welcome channel must be set first with `_setwelcomechannel`)",
    permissions: "moderator",
    usage: "<message> Include [user] to mention the new user. Use [Some channelID] to add a mention to a channel",
    run: (client, message, args) => {
        let guildID = message.guild.id;
        const logChannel = message.guild.channels.cache.find(c => c.name === "mod-logs") || message.channel;

        db.findOne({ guildID: guildID }, (err, exists) => {
            if (exists) {
                exists.welcomeMessage = `${args.join(' ')}`;
            }
            exists.save().catch(err => console.log(err));
        }).catch(err => err);

        const embed = new MessageEmbed()
            .setColor("#0efefe")
            .setTitle("Welcome Message Changed")
            .setFooter(message.member.displayName, message.author.displayAvatarURL())
            .setTimestamp()
            .setDescription(stripIndents`
            **Welcome message changed to:** ${args.join(' ')}
            **Welcome message changed by:** ${message.author}`);

        logChannel.send(embed);
        return message.reply(`Welcome message has been set to: ${args.join(' ')}`).then(m => del(m, 7500));
    }
}