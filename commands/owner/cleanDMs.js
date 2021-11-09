const { del } = require('../../functions.js');

module.exports = {
    name: "cleandms",
    aliases: ["cdm", "cdms"],
    category: "owner",
    description: "Cleans DM messages from bot to Owner.",
    permissions: "owner",
    run: async (client, message, args) => {
        let dm = await client.channels.fetch(process.env.DMCHANNELID);
        if (!dm) return message.reply("Send the bot a DM, then try this command again.").then(m => del(m, 7500));
        if (dm) message.reply("Now cleaning your DM's.").then(m => del(m, 7500));
        dm.messages.fetch().catch(err => err)
            .then(messages => messages.array().forEach(
                message => message.author.equals(client.user) && message.delete({ timeout: 0 }).catch(err => err)
            )).catch(err => err);
    }
}