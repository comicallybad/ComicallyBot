const { del } = require("../../functions.js");
const db = require('../../schemas/db.js');
const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");

module.exports = {
    name: "setwelcomemessage",
    aliases: ["setwelcomemsg", "swelcomemsg"],
    category: "welcoming",
    description: "Set a welcoming message for new users. (welcome channel must be set first with `_setwelcomechannel`)",
    permissions: "moderator",
    usage: "<message> Include [user] to mention the new user. Use [Some channelID] to add a mention to a channel",
    run: async (client, message, args) => {
        let guildID = message.guild.id;
        const logChannel = message.guild.channels.cache.find(c => c.name === "mod-logs") || message.channel;

        if (args.join(' ') >= 1024)
            return message.reply("Your welcome message must be 1024 characters or shorter.").then(m => del(m, 7500));

        db.findOne({ guildID: guildID }, (err, exists) => {
            if (exists) {
                exists.welcomeMessage = `${args.join(' ')}`;
            }
            exists.save().catch(err => console.log(err));
        }).catch(err => err);


        let welcomeMSG;
        let msg = args.join(' ').toString();
        let msgArray = msg.split(" ");
        let msgMap = await msgArray.map((guild, index) => {
            if (guild.replace(/[0-9]/g, "") == "[]") {
                let channel = client.channels.cache.get(guild.substring(1, guild.length - 1));
                return msgArray[index] = `${channel}`;
            } else return msgArray[index];
        });

        welcomeMSG = msgMap.join(" ");

        const embed = new MessageEmbed()
            .setColor("#0efefe")
            .setTitle("Welcome Message Changed")
            .setFooter(message.member.displayName, message.author.displayAvatarURL())
            .setTimestamp()
            .setDescription(stripIndents`
            **Welcome message changed to:** ${welcomeMSG}
            **Welcome message changed by:** ${message.author}`);

        logChannel.send(embed).catch(err => err);

        return message.reply(`Welcome message has been set to: ${welcomeMSG}`).then(m => del(m, 7500));
    }
}