const { r, del } = require("../../functions.js");

module.exports = {
    name: "reload",
    category: "owner",
    description: "Reloads a command.",
    permissions: "owner",
    usage: "<category> <command>",
    run: (client, message, args) => {
        if (message.author.id != process.env.USERID)
            return r(message.channel, message.author, "You're not the bot the owner!").then(m => del(m, 7500));

        if (!args[0])
            return r(message.channel, message.author, "Please provide a command to category!").then(m => del(m, 7500));

        if (!args[1])
            return r(message.channel, message.author, "Please provide a command to reload!").then(m => del(m, 7500));

        let commandCategory = args[0].toLowerCase();
        let commandName = args[1].toLowerCase();

        try {
            delete require.cache[require.resolve(`../${commandCategory}/${commandName}.js`)] // usage !reload <name>
            client.commands.delete(commandName)
            const pull = require(`../${commandCategory}/${commandName}.js`)
            client.commands.set(commandName, pull)
        } catch (e) {
            return r(message.channel, message.author, `Could not reload: \`${args[1].toUpperCase()}\``).then(m => del(m, 7500));
        }
        return r(message.channel, message.author, `The command \`${args[1].toUpperCase()}\` has been reloaded!`).then(m => del(m, 7500));
    }
}