const { del } = require("../../functions.js");
const db = require('../../schemas/db.js');
const { stripIndents } = require("common-tags");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "toggleall",
    aliases: ["ta", "allcommands", "commandsall"],
    category: "command",
    description: "Enable or disable commands.",
    permissions: "admin",
    usage: "<true/enable | false/disable>",
    run: (client, message, args) => {
        const logChannel = message.guild.channels.cache.find(c => c.name === "mod-logs") || message.channel;
        let guildID = message.guild.id;

        if (!args[0])
            return message.reply("Please provide a true or false/enable or disable.").then(m => del(m, 7500));

        if (args[0] !== "true" && args[0] !== "false" && args[0] !== "enable" && args[0] !== "disable")
            return message.reply("Please provide only true or false/enable or disable.").then(m => del(m, 7500));

        if (args[0] === "true" || args[0] === "enable") {
            client.commands.forEach((element, cmdIndex) => {
                db.updateOne({ guildID: guildID, 'commands.name': cmdIndex }, {
                    $set: { 'commands.$.status': true }
                }).catch(err => console.log(err));
            });

            const embed = new MessageEmbed()
                .setColor("#0efefe")
                .setTitle("All Commands Toggled")
                .setThumbnail(message.author.displayAvatarURL())
                .setFooter(message.member.displayName, message.author.displayAvatarURL())
                .setTimestamp()
                .setDescription(stripIndents`
                **Commands Toggled by: ${message.member.user}**
                **Commands Toggled: ON**`);

            logChannel.send(embed);

            return message.reply("Toggling all commands on... this may take a second...").then(m => del(m, 7500));
        }

        if (args[0] === "false" || args[0] === "disable") {
            client.commands.forEach((element, cmdIndex) => {
                db.updateOne({ guildID: guildID, 'commands.name': cmdIndex }, {
                    $set: { 'commands.$.status': false }
                }).catch(err => console.log(err));
            });

            const embed = new MessageEmbed()
                .setColor("#0efefe")
                .setTitle("All Commands Toggled")
                .setThumbnail(message.author.displayAvatarURL())
                .setFooter(message.member.displayName, message.author.displayAvatarURL())
                .setTimestamp()
                .setDescription(stripIndents`
                **Commands Toggled by: ${message.member.user}**
                **Commands Toggled: OFF**`);

            logChannel.send(embed);

            return message.reply("Toggling all commands off... this may take a second...").then(m => del(m, 7500));
        }
    }
}