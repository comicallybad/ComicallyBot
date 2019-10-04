const { getCommandStatus, getResponseChannel } = require("../../functions.js")

module.exports = {
    name: "ping",
    category: "info",
    description: "Returns latency and API ping",
    run: async (client, message, args) => {
        getCommandStatus(message, "ping").then(async function (res) {
            if (res === false) message.reply("Command disabled").then(m => m.delete(5000))
            if (res === true) {
                const msg = await message.channel.send(`🏓 Pinging....`);
                msg.edit(`🏓 Pong!
                Latency is ${Math.floor(msg.createdTimestap - message.createdTimestap)}ms
                API Latency is ${Math.round(client.ping)}ms`);
                if (message.deletable) message.delete();
            }
        });
    }
}