const { del } = require("../../functions.js");
const db = require('../../schemas/db.js');
const { stripIndents } = require("common-tags");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "togglecategory",
    aliases: ["togglecat", "cattoggle"],
    category: "command",
    description: "Enable or disable commands.",
    permissions: "admin",
    usage: "<category> <on/true/enable | off/false/disable>",
    run: (client, message, args) => {
        const logChannel = message.guild.channels.cache.find(c => c.name.includes("mod-logs")) || message.channel;
        let guildID = message.guild.id;
        let categories = client.commands.map(command => command.category)
        let commands = client.commands

        if (!args[0])
            return message.reply("Please provide a category.").then(m => del(m, 7500));

        if (!categories.includes(args[0]))
            return message.reply("Category not found.").then(m => del(m, 7500));

        if (args[0] == "command" || args[0] == "owner" || args[0] == "support")
            return message.reply("You may not toggle this category.").then(m => del(m, 7500));

        if (!args[1])
            return message.reply("Please provide an on/off, true/false or enable/disable.").then(m => del(m, 7500));

        if (!args[1] === "true" || !args[1] === "false" || !args[1] === "enable" || !args[1] === "disable" || !args[1] === "on" || !args[1] === "off")
            return message.reply("Please provide only on/off, true/false or enable/disable.").then(m => del(m, 7500));

        if (args[1] === "true" || args[1] === "enable" || args[1] === "on") {
            commands = commands.map(function (command) {
                if (command.category === args[0]) return command.name
            }).filter(m => m)
            commands.forEach((element) => {
                db.updateOne({ guildID: guildID, 'commands.name': element }, {
                    $set: { 'commands.$.status': true }
                }).catch(err => console.log(err))
            })

            const embed = new MessageEmbed()
                .setColor("#0efefe")
                .setTitle("Command Category Toggled")
                .setThumbnail(message.author.displayAvatarURL())
                .setFooter(message.member.displayName, message.author.displayAvatarURL())
                .setTimestamp()
                .setDescription(stripIndents`
                **Commands Toggled by:** ${message.member.user}
                **Commands Category:** ${args[0]}
                **Commands Toggled:** ON`);

            logChannel.send(embed).catch(err => err);

            return message.reply("Enabling category... this may take a second...").then(m => del(m, 7500));
        }

        if (args[1] === "false" || args[1] === "disable" || args[1] === "off") {
            commands = commands.map(function (command) {
                if (command.category === args[0]) return command.name
            }).filter(m => m)
            commands.forEach((element) => {
                db.updateOne({ guildID: guildID, 'commands.name': element }, {
                    $set: { 'commands.$.status': false }
                }).catch(err => console.log(err));
            });

            const embed = new MessageEmbed()
                .setColor("#0efefe")
                .setTitle("Command Category Toggled")
                .setThumbnail(message.author.displayAvatarURL())
                .setFooter(message.member.displayName, message.author.displayAvatarURL())
                .setTimestamp()
                .setDescription(stripIndents`
                **Commands Toggled by:** ${message.member.user}
                **Commands Category:** ${args[0]}
                **Commands Toggled:** OFF`);

            logChannel.send(embed).catch(err => err);

            return message.reply("Disabling category... this may take a second...").then(m => del(m, 7500));
        }
    }
}