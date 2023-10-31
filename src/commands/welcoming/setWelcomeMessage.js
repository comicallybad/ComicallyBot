const { s, r, del } = require("../../../utils/functions/functions.js");
const db = require("../../../utils/schemas/db.js");
const { EmbedBuilder } = require("discord.js");
const { stripIndents } = require("common-tags");

module.exports = {
    name: "setwelcomemessage",
    aliases: ["setwelcomemsg"],
    category: "welcoming",
    description: "Set a welcoming message for new users. (welcome channel must be set first with `_setwelcomechannel`)",
    permissions: "moderator",
    usage: "<message> Include [user] to mention the new user. Use [Some channelID] to add a mention to a channel",
    run: async (client, message, args) => {
        if (!args[0])
            return r(message.channel, message.author, `Please input the welcome message you wish to set after ${prefix} `).then(m => del(m, 7500));

        if (args.join(' ') >= 1024)
            return r(message.channel, message.author, "Your welcome message must be 1024 characters or shorter.").then(m => del(m, 7500));

        let guildID = message.guild.id;
        const logChannel = message.guild.channels.cache.find(c => c.name.includes("mod-logs")) || message.channel;

        db.findOne({ guildID: guildID }, (err, exists) => {
            if (exists) exists.welcomeMessage = `${args.join(' ')}`;
            exists.save().catch(err => err);
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

        const embed = new EmbedBuilder()
            .setColor("#0efefe")
            .setTitle("Welcome Message Changed")
            .setFooter({ text: message.member.displayName, iconURL: message.author.displayAvatarURL() })
            .setTimestamp()
            .setDescription(stripIndents`
            **Welcome message changed To:** ${welcomeMSG}
            **Welcome message changed By:** ${message.author}`);

        s(logChannel, '', embed);

        return r(message.channel, message.author, `Welcome message has been set to: ${welcomeMSG}`).then(m => del(m, 7500));
    }
}