const db = require('../../schemas/db.js');

module.exports = {
    name: "totset",
    aliases: ["settotchannel", "totsetchannel", "settot"],
    category: "tot",
    description: "Set response channel for This Or That Command",
    permissions: "moderator",
    usage: "<channelID|#channel>",
    run: (client, message, args) => {
        if (message.deletable) message.delete();
        if (!args[0])
            return message.reply("Please provide a channel.").then(m => m.delete(7500))

        let guildID = message.guild.id;
        let serverChannels = client.channels.map(channel => channel).filter(channel => channel.type === "text").filter(channel => channel.guild.id === guildID)
        let channelNames = serverChannels.map(channel => channel.name)
        let channelIDs = serverChannels.map(channel => channel.id)
        let hashMention = args[0].slice(2, args[0].length - 1)

        if (!channelIDs.includes(hashMention) && !channelIDs.includes(args[0]))
            return message.reply("Channel not found in this server").then(m => m.delete(7500));

        if (channelIDs.includes(args[0]))
            dbUpdate(args[0], channelNames[channelIDs.indexOf(args[0])]);

        if (channelIDs.includes(hashMention))
            dbUpdate(hashMention, channelNames[channelIDs.indexOf(hashMention)])

        function dbUpdate(channelID, channelName) {
            db.findOne({ guildID: guildID, channels: { $elemMatch: { command: "tot" } } }, (err, exists) => {
                if (err) console.log(err)
                if (!exists) {
                    //push channel if it doesn't exist
                    db.updateOne({ guildID: guildID },
                        {
                            $push: { channels: { command: "tot", channelID: channelID, channelName: channelName } }
                        }).catch(err => console.log(err))
                } else {
                    ///update channel if it does exist
                    db.updateOne({ guildID: guildID, 'channels.command': "tot" }, {
                        $set: { 'channels.$.channelID': channelID, 'channels.$.channelName': channelName }
                    }).catch(err => console.log(err))
                }
            }).catch(err => console.log(err))
            return message.reply("Updating channel... this may take a second...").then(m => m.delete(7500))
        }
    }
}