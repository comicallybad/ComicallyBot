const { r, del } = require('../../functions.js');

module.exports = {
    name: "cleandms",
    aliases: ["cdm", "cdms"],
    category: "owner",
    description: "Cleans DM messages from bot to Owner.",
    permissions: "owner",
    run: async (client, message, args) => {
        if (message.author.id != process.env.USERID)
            return r(message.channel, message.author, "You're not the bot the owner!").then(m => del(m, 7500));

        let dm = await client.channels.fetch(process.env.DMCHANNELID);
        if (dm) r(message.channel, message.author, "Now cleaning your DM's.").then(m => del(m, 7500));
        dm.messages.fetch().catch(err => console.log(err.stack))
            .then(messages => messages.map(m => m).forEach(
                message => message.author.equals(client.user) && message.delete({ timeout: 0 }).catch(err => err)
            )).catch(err => console.log(err.stack));
    }
}