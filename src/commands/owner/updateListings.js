const { s, r, del } = require("../../../utils/functions/functions.js");
const fetch = require("node-fetch");

module.exports = {
    name: "updatelistings",
    category: "owner",
    description: "Update server listing info.",
    permissions: "owner",
    run: async (client, message, args) => {
        if (message.author.id != process.env.USERID)
            return r(message.channel, message.author, "You're not the bot the owner!").then(m => del(m, 7500));

        const discordbotlistngBot = await fetch('https://discordbotlist.com/api/v1/bots/492495421822730250/stats', {
            method: 'post',
            headers: { 'Authorization': process.env.DISCORDBOTLISTING, 'content-type': 'application/json' },
            body: JSON.stringify({ users: client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0), guilds: client.guilds.cache.size, shard_id: 0, voice_connections: 0 })
        }).then(res => s(message.channel, `Response from discordbotlist \`statusText: ${res.statusText}\``).then(m => del(m, 7500))).catch(err => r(message.channel, message.author, ` There was an error attempting to update discordbotlists stats. ${err}`));
        const topgg = await fetch('https://top.gg/api/bots/492495421822730250/stats', {
            method: 'post',
            headers: { 'Authorization': process.env.TOPGG, 'content-type': 'application/json' },
            body: JSON.stringify({ server_count: client.guilds.cache.size, shard_id: 0, shard_count: client.shard.count })
        }).then(res => s(message.channel, `Response from top.gg \`statusText: ${res.statusText}\``).then(m => del(m, 7500))).catch(err => r(message.channel, message.author, `There was an error attempting to update top.gg stats. ${err}`));

        return;
    }
}