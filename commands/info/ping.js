const { s, e } = require('../../functions.js')

module.exports = {
    name: "ping",
    aliases: ["latency"],
    category: "info",
    description: "Returns latency and API ping.",
    permissions: "member",
    run: async (client, message, args) => {
        return s(message.channel, "Pinging...").then(msg => {
            let ping = msg.createdTimestamp - message.createdTimestamp

            e(msg, msg.channel, `🏓 Pong!
                        Latency is ${ping}ms
                        API Latency is ${Math.round(client.ws.ping)}ms`);
        }).catch(err => err);
    }
}