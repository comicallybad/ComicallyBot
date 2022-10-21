const { s, r, del } = require("../../functions.js");
const db = require('../../schemas/db.js');
const { stripIndents } = require("common-tags");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "togglecategory",
    aliases: ["togglecat"],
    category: "command",
    description: "Enable or disable commands.",
    permissions: "admin",
    usage: "<category> <on/true/enable | off/false/disable>",
    run: (client, message, args) => {
        if (!args[0])
            return r(message.channel, message.author, "Please provide a category.").then(m => del(m, 7500));

        let categories = client.commands.map(command => command.category)

        if (!categories.includes(args[0]))
            return r(message.channel, message.author, "Category not found.").then(m => del(m, 7500));

        if (args[0] == "command" || args[0] == "owner" || args[0] == "support")
            return r(message.channel, message.author, "You may not toggle this category.").then(m => del(m, 7500));

        if (!args[1])
            return r(message.channel, message.author, "Please provide an on/off, true/false or enable/disable.").then(m => del(m, 7500));

        if (args[1] !== "true" && args[1] !== "false" && args[1] !== "enable" && args[1] !== "disable" && args[1] !== "on" && args[1] !== "off")
            return r(message.channel, message.author, "Please provide only true or false/enable or disable/on or off option.").then(m => del(m, 7500));

        const logChannel = message.guild.channels.cache.find(c => c.name.includes("mod-logs")) || message.channel;
        const guildID = message.guild.id;
        let commands = client.commands

        let bool;

        if (args[1] === "true" || args[1] === "enable" || args[1] === "on") bool = "ON";
        if (args[1] === "false" || args[1] === "disable" || args[1] === "off") bool = "OFF";

        if (args[1] === "true" || args[1] === "enable" || args[1] === "on") {
            commands = commands.map(command => {
                if (command.category === args[0]) return command.name
            }).filter(m => m)
            commands.forEach(element => {
                db.updateOne({ guildID: guildID, 'commands.name': element }, {
                    $set: { 'commands.$.status': true }
                }).catch(err => err);
            });
        } else if (args[1] === "false" || args[1] === "disable" || args[1] === "off") {
            commands = commands.map(command => {
                if (command.category === args[0]) return command.name
            }).filter(m => m !== "help")
            commands.forEach(element => {
                db.updateOne({ guildID: guildID, 'commands.name': element }, {
                    $set: { 'commands.$.status': false }
                }).catch(err => err);
            });
        }

        const embed = new MessageEmbed()
            .setColor("#0efefe")
            .setTitle(`Command Category Toggled **${bool}**`)
            .setThumbnail(message.author.displayAvatarURL())
            .setFooter({ text: message.member.displayName, iconURL: message.author.displayAvatarURL() })
            .setTimestamp()
            .setDescription(stripIndents`
                **Commands Toggled By:** ${message.member.user}
                **Commands Category:** ${args[0]}`);

        s(logChannel, '', embed)

        return r(message.channel, message.author, `Category toggled ${bool}.`).then(m => del(m, 7500));
    }
}