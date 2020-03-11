const { del } = require("../../functions.js");
const db = require('../../schemas/db.js');

module.exports = {
    name: "totget",
    aliases: ["gettot", "totchannel", "channeltot"],
    category: "tot",
    description: "Get response channel for This Or That Command.",
    permissions: "moderator",
    run: (client, message, args) => {
        let guildID = message.guild.id;

        db.findOne({ guildID: guildID, channels: { $elemMatch: { command: "tot" } } }, (err, exists) => {
            if (err) console.log(err)
            if (!exists) return message.reply("Channel has not been set.").then(m => del(m, 7500));
            else return message.reply(`TOT's response channel is: <#${exists.channels[exists.channels.map(cmd => cmd.command).indexOf("tot")].channelID}>`).then(m => del(m, 7500));
        }).catch(err => console.log(err))
    }
}