const db = require('../../schemas/db.js');

module.exports = {
    name: "togglecategory",
    aliases: ["togglecat", "cattoggle"],
    category: "command",
    description: "Enable or disable commands",
    permissions: "admin",
    usage: "<category> <true|false>",
    run: (client, message, args) => {
        let guildID = message.guild.id;
        let categories = client.commands.map(command => command.category)
        let commands = client.commands

        if (message.deletable) message.delete();

        if (!args[0])
            return message.reply("Please provide a category.").then(m => m.delete(7500));

        if (!categories.includes(args[0]))
            return message.reply("Category not found.")

        if (!args[1])
            return message.reply("Please provide a true/false or enable/disable.").then(m => m.delete(7500));

        if (!args[1] === "true" || !args[1] === "false" || !args[1] === "enable" || !args[1] === "disable")
            return message.reply("Please provide only true/false or enable/disable.").then(m => m.delete(7500));

        if (args[1] === "true" || args[1] === "enable") {
            commands = commands.map(function (command) {
                if (command.category === args[0]) return command.name
            }).filter(m => m)
            commands.forEach((element) => {
                db.updateOne({ guildID: guildID, 'commands.name': element }, {
                    $set: { 'commands.$.status': true }
                }).catch(err => console.log(err))
            })
            return message.reply("Enabling category... this may take a second...").then(m => m.delete(7500));
        }

        if (args[1] === "false" || args[1] === "disable") {
            commands = commands.map(function (command) {
                if (command.category === args[0]) return command.name
            }).filter(m => m)
            commands.forEach((element) => {
                db.updateOne({ guildID: guildID, 'commands.name': element }, {
                    $set: { 'commands.$.status': false }
                }).catch(err => console.log(err))
            })
            return message.reply("Disabling category... this may take a second...").then(m => m.delete(7500));
        }
    }
}