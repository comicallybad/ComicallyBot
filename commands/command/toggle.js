const { s, del } = require("../../functions.js");
const db = require('../../schemas/db.js');
const { stripIndents } = require("common-tags");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "toggle",
    aliases: ["tog"],
    category: "command",
    description: "Enable or disable commands.",
    permissions: "admin",
    usage: "<command> <on/true/enable | off/false/disable>",
    run: (client, message, args) => {
        let commands = client.commands.map(cmd => cmd.name);
        let invalidCommands = client.commands.map(function (cmd) {
            if (cmd.category == "command" || cmd.category == "owner" || cmd.category == "support") return cmd.name;
        }).filter(cmd => cmd);
        let catCommandAliases = (client.commands.map(function (cmd) {
            if (cmd.category == "command" || cmd.category == "owner" || cmd.category == "support") return cmd.aliases;
        }).filter(cmd => cmd));
        let invalidAliases = [].concat.apply([], catCommandAliases)

        let aliases = client.commands.map(cmd => cmd.aliases);
        let aliasList = [].concat.apply([], aliases)

        if (!args[0])
            return message.reply("Please provide the command you wish to toggle.").then(m => del(m, 7500));

        if (!commands.includes(args[0]) && !aliasList.includes(args[0]))
            return message.reply("Please provide a valid command.").then(m => del(m, 7500));

        if (invalidCommands.includes(args[0]) || invalidAliases.includes(args[0]))
            return message.reply("You may not toggle this command.").then(m => del(m, 7500));

        if (!args[1])
            return message.reply("Please provide a true or false/enable or disable.").then(m => del(m, 7500));

        if (args[1] !== "true" && args[1] !== "false" && args[1] !== "enable" && args[1] !== "disable")
            return message.reply("Please provide only true or false/enable or disable.").then(m => del(m, 7500));

        if (commands.includes(args[0])) {
            let command = args[0];
            toggle(message, args, command)
        } else if (aliasList.includes(args[0])) {
            let command = client.commands.map(function (cmd) {
                if (cmd.aliases)
                    if (cmd.aliases.includes(args[0]) && cmd.category !== "command")
                        return cmd.name
            }).filter(cmd => cmd)[0]
            toggle(message, args, command)
        }
    }
}

function toggle(message, args, command) {
    const logChannel = message.guild.channels.cache.find(c => c.name.includes("mod-logs")) || message.channel;
    let guildID = message.guild.id;
    let bool;

    if (args[1] === "true" || args[1] === "enable" || args[1] === "on") bool = true;
    if (args[1] === "false" || args[1] === "disable" || args[1] === "off") bool = false;

    db.updateOne({ guildID: guildID, 'commands.name': command }, {
        $set: { 'commands.$.status': bool }
    }).catch(err => console.log(err));

    const embed = new MessageEmbed()
        .setColor("#0efefe")
        .setTitle("Command Toggled")
        .setThumbnail(message.author.displayAvatarURL())
        .setFooter(message.member.displayName, message.author.displayAvatarURL())
        .setTimestamp()
        .setDescription(stripIndents`
        **Command Toggled by:** ${message.member.user}
        **Command Toggled:** ${command}`);

    s(logChannel, '', embed).catch(err => err);

    return message.reply("Toggling command... this may take a second...").then(m => del(m, 7500));
}