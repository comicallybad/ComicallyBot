const db = require("../../schemas/db.js");
const { del } = require("../../functions.js")

module.exports = {
    name: "addbotchatchannel",
    aliases: ["addbotchannel", "abc", "updatebotchatchannel", "updatebotchannel", "ubc", "sbc"],
    category: "autochat",
    description: "Adds the channel where the bot can talk to people.",
    permissions: "moderator",
    run: (client, message, args) => {
        if (!args[0])
            return message.reply("Please provide a channel ID or hash mention").then(m => del(m, 7500));

        if (!message.mentions.channels.first())
            return message.reply("Please provide a valid channel").then(m => del(m, 7500));
        else {
            db.findOne({ guildID: message.guild.id, channels: { $elemMatch: { command: "Bot Chatting" } } }, (err, exists) => {
                if (exists) {
                    db.updateOne({ guildID: message.guild.id, 'channels.command': "Bot Chatting" }, {
                        $set: { 'channels.$.command': "Bot Chatting", 'channels.$.channelID': message.mentions.channels.first().id, 'channels.$.channelName': message.mentions.channels.first().name, }
                    }).catch(err => console.log(err));
                    return message.reply("Updating bot chatting channel.").then(m => del(m, 7500));
                } else {
                    db.updateOne({ guildID: message.guild.id }, {
                        $push: { channels: { command: "Bot Chatting", channelID: message.mentions.channels.first().id, channelName: message.mentions.channels.first().name } }
                    }).catch(err => console.log(err));
                    return message.reply("Successfully added bot chat channel.").then(m => del(m, 7500));
                }
            });
        }
    }
}