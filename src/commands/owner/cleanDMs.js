const { s, del } = require("../../../utils/functions/functions.js");;

module.exports = {
    name: "cleandms",
    aliases: ["cdms"],
    category: "owner",
    description: "Cleans DM messages from bot to Owner.",
    permissions: "owner",
    run: async (client, message, args) => {
        if (message.author.id != process.env.USERID)
            return s(message.channel, "You're not the bot the owner!").then(m => del(m, 7500));

        const dm = await client.channels.fetch(process.env.DMCHANNELID);
        if (dm) s(message.channel, "Now cleaning your DM's.").then(m => del(m, 7500));

        return dm.messages.fetch().then(messages => messages.map(m => m).forEach(message =>
            message.author.equals(client.user) && message.delete({ timeout: 0 }).catch(err => err)
        )).catch(err => err);
    }
}