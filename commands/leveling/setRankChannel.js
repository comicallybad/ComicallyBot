const { r, del } = require("../../functions.js");
const db = require('../../schemas/db.js');

module.exports = {
    name: "setrankchannel",
    aliases: ["setrankch"],
    category: "leveling",
    description: "Set response channel for leveling.",
    permissions: "moderator",
    usage: "<#channel | channelID>",
    run: async (client, message, args) => {
        if (!args[0])
            return r(message.channel, message.author, "Please provide a channel.").then(m => del(m, 7500));

        const guildID = message.guild.id;
        let channel = await message.guild.channels.fetch(args[0]).catch(err => { return; })
        let channelMention = await message.guild.channels.fetch(message.mentions.channels.first()?.id).catch(err => { return; })

        if (!channel && !channelMention)
            return r(message.channel, message.author, "Channel not found in this server.").then(m => del(m, 7500));

        if (channel)
            return dbUpdate(channel.id, channel.name);

        if (channelMention)
            return dbUpdate(channelMention.id, channelMention.name);

        function dbUpdate(channelID, channelName) {
            db.findOne({ guildID: guildID, channels: { $elemMatch: { command: "rank" } } }, (err, exists) => {
                if (!exists) {
                    db.updateOne({ guildID: guildID }, {
                        $push: { channels: { command: "rank", channelID: channelID, channelName: channelName } }
                    }).catch(err => err);
                    return r(message.channel, message.author, `Rank channel has been set to: ${channel ? channel : channelMention}.`).then(m => del(m, 7500));
                } else {
                    db.updateOne({ guildID: guildID, 'channels.command': "rank" }, {
                        $set: { 'channels.$.channelID': channelID, 'channels.$.channelName': channelName }
                    }).catch(err => err);
                    return r(message.channel, message.author, `Updated rank response channel to: ${channel ? channel : channelMention}.`).then(m => del(m, 7500));
                }
            }).catch(err => err);
        }
    }
}