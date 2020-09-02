module.exports = {
    name: "ping",
    category: "info",
    description: "Returns latency and API ping.",
    permissions: "member",
    run: async (client, message, args) => {
        message.channel.send("Pinging...").then(msg => {
            let ping = msg.createdTimestamp - message.createdTimestamp

            msg.edit(`🏓 Pong!
                        Latency is ${ping}ms
                        API Latency is ${Math.round(client.ws.ping)}ms`);
        }).catch(err => console.log(`There was an error in ping ${err}`));
    }
}