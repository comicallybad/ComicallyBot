module.exports = {
    name: "ping",
    category: "info",
    description: "Returns latency and API ping",
    permissions: "member",
    run: async (client, message, args) => {
        if (message.deletable) message.delete();
        const msg = await message.channel.send(`🏓 Pinging....`);
        msg.edit(`🏓 Pong!
                Latency is ${Math.floor(msg.createdTimestap - message.createdTimestap)}ms
                API Latency is ${Math.round(client.ping)}ms`);
    }
}