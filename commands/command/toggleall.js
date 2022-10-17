const { s, r, del } = require("../../functions.js");
const db = require('../../schemas/db.js');
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "toggleall",
    aliases: ["togall"],
    category: "command",
    description: "Enable or disable commands.",
    permissions: "admin",
    usage: "<on/true/enable | off/false/disable>",
    run: (client, message, args) => {
        if (!args[0])
            return r(message.channel, message.author, "Please provide an on/off, true/false or enable/disable.").then(m => del(m, 7500));

        if (!args[0] === "true" || !args[0] === "false" || !args[0] === "enable" || !args[0] === "disable" || !args[0] === "on" || !args[0] === "off")
            return r(message.channel, message.author, "Please provide only true or false/enable or disable.").then(m => del(m, 7500));

        const logChannel = message.guild.channels.cache.find(c => c.name.includes("mod-logs")) || message.channel;
        const guildID = message.guild.id;
        let bool;

        if (args[0] === "true" || args[0] === "enable" || args[0] === "on") bool = "ON";
        if (args[0] === "false" || args[0] === "disable" || args[0] === "off") bool = "OFF";

        if (args[0] === "true" || args[0] === "enable" || args[0] === "on")
            client.commands.forEach((element, cmdIndex) => {
                db.updateOne({ guildID: guildID, 'commands.name': cmdIndex }, {
                    $set: { 'commands.$.status': true }
                }).catch(err => err);
            });
        else if (args[0] === "false" || args[0] === "disable" || args[0] === "off")
            client.commands.forEach((element, cmdIndex) => {
                db.updateOne({ guildID: guildID, 'commands.name': cmdIndex }, {
                    $set: { 'commands.$.status': false }
                }).catch(err => err);
            });

        const embed = new MessageEmbed()
            .setColor("#0efefe")
            .setTitle(`All Commands Toggled **${bool}**`)
            .setThumbnail(message.author.displayAvatarURL())
            .setFooter({ text: message.member.displayName, iconURL: message.author.displayAvatarURL() })
            .setTimestamp()
            .setDescription(`**Commands Toggled By:** ${message.member.user}`);

        s(logChannel, '', embed);

        return r(message.channel, message.author, `Toggling all commands ${bool}.`).then(m => del(m, 7500));
    }
}