const { r, del } = require("../../functions.js");
const db = require('../../schemas/db.js');

module.exports = {
    name: "getwelcomemessage",
    aliases: ["getwelcomemsg", "gwelcomemsg"],
    category: "welcoming",
    description: "Get's the current welcome channel.",
    permissions: "moderator",
    run: (client, message, args) => {
        let guildID = message.guild.id;

        let welcomeMSG;
        db.findOne({ guildID: guildID }, async (err, exists) => {
            if (exists) {
                if (exists.welcomeMessage.length > 0) {
                    let msg = exists.welcomeMessage.toString();
                    let msgArray = msg.split(" ");
                    let msgMap = await msgArray.map((guild, index) => {
                        if (guild.replace(/[0-9]/g, "") == "[]") {
                            let channel = client.channels.cache.get(guild.substring(1, guild.length - 1));
                            return msgArray[index] = `${channel}`;
                        } else return msgArray[index];
                    });
                    welcomeMSG = msgMap.join(" ");
                    return r(message.channel, message.author, welcomeMSG).then(m => del(m, 30000));
                } else return r(message.channel, message.author, "A welcome message has not been set.").then(m => del(m, 7500))
            }
        }).catch(err => err);
    }
}