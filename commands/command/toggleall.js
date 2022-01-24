const { s, r, del } = require("../../functions.js");
const db = require('../../schemas/db.js');
const { stripIndents } = require("common-tags");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "toggleall",
    aliases: ["togall"],
    category: "command",
    description: "Enable or disable commands.",
    permissions: "admin",
    usage: "<on/true/enable | off/false/disable>",
    run: (client, message, args) => {
        const logChannel = message.guild.channels.cache.find(c => c.name.includes("mod-logs")) || message.channel;
        let guildID = message.guild.id;

        if (!args[0])
            return r(message.channel, message.author, "Please provide an on/off, true/false or enable/disable.").then(m => del(m, 7500));

        if (args[0] !== "true" && args[0] !== "false" && args[0] !== "enable" && args[0] !== "disable")
            return r(message.channel, message.author, "Please provide only true or false/enable or disable.").then(m => del(m, 7500));

        if (args[0] === "true" || args[0] === "enable" || args[0] === "on") {
            client.commands.forEach((element, cmdIndex) => {
                db.updateOne({ guildID: guildID, 'commands.name': cmdIndex }, {
                    $set: { 'commands.$.status': true }
                }).catch(err => console.log(err));
            });

            const embed = new MessageEmbed()
                .setColor("#0efefe")
                .setTitle("All Commands Toggled")
                .setThumbnail(message.author.displayAvatarURL())
                .setFooter({ text: message.member.displayName, iconURL: message.author.displayAvatarURL() })
                .setTimestamp()
                .setDescription(stripIndents`
                **Commands Toggled by:** ${message.member.user}
                **Commands Toggled:** ON`);

            s(logChannel, '', embed);

            return r(message.channel, message.author, "Toggling all commands on... this may take a second...").then(m => del(m, 7500));
        }

        if (args[0] === "false" || args[0] === "disable" || args[0] === "off") {
            client.commands.forEach((element, cmdIndex) => {
                db.updateOne({ guildID: guildID, 'commands.name': cmdIndex }, {
                    $set: { 'commands.$.status': false }
                }).catch(err => console.log(err));
            });

            const embed = new MessageEmbed()
                .setColor("#0efefe")
                .setTitle("All Commands Toggled")
                .setThumbnail(message.author.displayAvatarURL())
                .setFooter({ text: message.member.displayName, iconURL: message.author.displayAvatarURL() })
                .setTimestamp()
                .setDescription(stripIndents`
                **Commands Toggled by: ${message.member.user}
                **Commands Toggled:** OFF`);

            s(logChannel, '', embed);

            return r(message.channel, message.author, "Toggling all commands off... this may take a second...").then(m => del(m, 7500));
        }
    }
}