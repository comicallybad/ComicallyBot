const { del } = require("../../functions.js")
const fetch = require("node-fetch");

module.exports = {
    name: "updatelistings",
    aliases: ["updatelisting", "listingupdate"],
    category: "info",
    description: "Update server listing info.",
    permissions: "Owner",
    run: async (client, message, args) => {
        const discordbotlistngBot = await fetch('https://discordbotlist.com/api/v1/bots/492495421822730250/stats', {
            method: 'post',
            headers: { "Authorization": `${process.env.DISCORDLISTING}`, "content-type": "application/json" },
            body: JSON.stringify({ users: client.users.cache.size, guilds: client.guilds.cache.size })
        }).catch(err => message.reply(`There was an error attempting to update discordbotlists stats. ${err}`));
        const topgg = await fetch('https://top.gg/api/bots/492495421822730250/stats', {
            method: 'post',
            headers: { "Authorization": `${process.env.TOPGG}`, "content-type": "application/json" },
            body: JSON.stringify({ server_count: client.guilds.cache.size })
        }).catch(err => message.reply(`There was an error attempting to update top.gg stats. ${err}`));

        return message.reply(`Update POST sent to discord listing sites.`).then(m => del(m, 7500));
    }
}