const { s, r, del } = require("../../../utils/functions/functions.js");
const db = require("../../../utils/schemas/db.js");
const { EmbedBuilder } = require("discord.js");
const { stripIndents } = require("common-tags");

module.exports = {
    name: "setwelcomechannel",
    aliases: ["setwelcomech"],
    category: "welcoming",
    description: "Set a channel for welcoming users.",
    permissions: "moderator",
    usage: "<#channel | channelID>",
    run: (client, message, args) => {
        if (!args[0])
            return r(message.channel, message.author, "Please provide a channel.").then(m => del(m, 7500));

        const logChannel = message.guild.channels.cache.find(c => c.name.includes("mod-logs")) || message.channel;
        let guildID = message.guild.id;
        let serverChannels = client.channels.cache.map(channel => channel).filter(channel => channel.type === "text").filter(channel => channel.guild.id === guildID)
        let channelNames = serverChannels.map(channel => channel.name)
        let channelIDs = serverChannels.map(channel => channel.id)

        if (!message.mentions.channels.first() && !channelIDs.includes(args[0]))
            return r(message.channel, message.author, "Channel not found in this server.").then(m => del(m, 7500));

        if (channelIDs.includes(args[0]))
            return dbUpdate(args[0], channelNames[channelIDs.indexOf(args[0])]);

        if (message.mentions.channels.first())
            return dbUpdate(message.mentions.channels.first().id, message.mentions.channels.first().name);

        function dbUpdate(channelID, channelName) {
            return db.findOne({ guildID: guildID, channels: { $elemMatch: { command: "welcome" } } }, (err, exists) => {
                if (!exists) {
                    //push channel if it doesn't exist
                    const embed = new EmbedBuilder()
                        .setColor("#0efefe")
                        .setTitle("Welcome Channel Set")
                        .setFooter({ text: message.member.displayName, iconURL: message.author.displayAvatarURL() })
                        .setTimestamp()
                        .setDescription(stripIndents`
                        **Welcome channel set To:** ${args[0]}
                        **Welcome channel changed By:** ${message.author}`);

                    db.updateOne({ guildID: guildID }, {
                        $push: { channels: { command: "welcome", channelID: channelID, channelName: channelName } }
                    }).catch(err => err);

                    s(logChannel, '', embed);
                    return r(message.channel, message.author, "Welcome channel has been set!").then(m => del(m, 7500));
                } else {
                    ///update channel if it does exist
                    const embed = new EmbedBuilder()
                        .setColor("#0efefe")
                        .setTitle("Welcome Channel Changed")
                        .setFooter({ text: message.member.displayName, iconURL: message.author.displayAvatarURL() })
                        .setTimestamp()
                        .setDescription(stripIndents`
                        **Welcome channel changed To:** ${args[0]}
                        **Welcome channel changed By:** ${message.author}`);

                    db.updateOne({ guildID: guildID, 'channels.command': "welcome" }, {
                        $set: { 'channels.$.channelID': channelID, 'channels.$.channelName': channelName }
                    }).catch(err => err);

                    s(logChannel, '', embed);
                    return r(message.channel, message.author, "Updated welcome channel.").then(m => del(m, 7500));
                }
            }).catch(err => err);
        }
    }
}