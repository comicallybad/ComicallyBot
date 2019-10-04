const { getCommandStatus } = require("../../functions.js")
const db = require('../../schemas/db.js');

module.exports = {
    name: "totset",
    aliases: ["settotchannel", "totsetchannel", "settot"],
    category: "tot",
    description: "Set response channel for This Or That Command",
    usage: "<channelID|#channel>",
    run: (client, message, args) => {
        getCommandStatus(message, "totset").then(function (res) {
            if (res === false) message.reply("Command disabled").then(m => m.delete(5000))
            if (res === true) {
                if (message.member.hasPermission("ADMINISTRATOR")) {
                    if (message.deletable) message.delete();
                    if (!args[0])
                        return message.reply("Please provide a channel.").then(m => m.delete(7500))

                    let guildID = message.guild.id;
                    let serverChannels = client.channels.map(channel => channel).filter(channel => channel.type === "text").filter(channel => channel.guild.id === guildID)
                    let channelIDs = serverChannels.map(channel => channel.id)
                    let hashMention = args[0].slice(2, args[0].length - 1)

                    if (!channelIDs.includes(hashMention) && !channelIDs.includes(args[0]))
                        return message.reply("Channel not found in this server").then(m => m.delete(7500));

                    if (channelIDs.includes(args[0]))
                        dbUpdate(args[0]);

                    if (channelIDs.includes(hashMention))
                        dbUpdate(hashMention)

                    function dbUpdate(channel) {
                        db.findOne({ guildID: guildID, channels: { $elemMatch: { name: "tot" } } }, (err, exists) => {
                            if (err) console.log(err)
                            if (!exists) {
                                //push channel if it doesn't exist
                                db.updateOne({ guildID: guildID },
                                    {
                                        $push: { channels: { name: "tot", channelID: channel } }
                                    }).catch(err => console.log(err))
                            } else {
                                ///update channel if it doesn't exist
                                db.updateOne({ guildID: guildID, 'channels.name': "tot" }, {
                                    $set: { 'channels.$.channelID': channel }
                                }).catch(err => console.log(err))
                            }
                        }).catch(err => console.log(err))
                        return message.reply("Updating channel... this may take a second...").then(m => m.delete(7500))
                    }
                }
            }
        });
    }
}