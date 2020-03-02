const db = require('../../schemas/db.js');

const { stripIndents } = require("common-tags");
const { RichEmbed } = require("discord.js");

module.exports = {
    name: "toggle",
    aliases: ["command"],
    category: "command",
    description: "Enable or disable commands.",
    permissions: "admin",
    usage: "<command> <true|false>",
    run: (client, message, args) => {
        const logChannel = message.guild.channels.find(c => c.name === "mods-log") || message.channel;
        let guildID = message.guild.id;
        let commands = client.commands.map(cmd => cmd.name);

        if (!args[0])
            return message.reply("Please provide the command you wish to toggle.").then(m => m.delete(7500));

        if (!commands.includes(args[0]))
            return message.reply("Please provide a valid command.").then(m => m.delete(7500));

        if (args[0] === "toggle")
            return message.reply("You can't toggle the toggle command silly!").then(m => m.delete(7500));

        if (args[0] === "help")
            return message.reply("You can't toggle the help command silly!").then(m => m.delete(7500));

        if (args[0] === "status")
            return message.reply("You can't toggle the status command silly!").then(m => m.delete(7500));

        if (args[0] === "toggleall")
            return message.reply("You can't toggle the toggleall command silly!").then(m => m.delete(7500));

        if (!args[1])
            return message.reply("Please provide a true or false/enable or disable.").then(m => m.delete(7500));

        if (args[1] !== "true" && args[1] !== "false" && args[1] !== "enable" && args[1] !== "disable")
            return message.reply("Please provide only true or false/enable or disable.").then(m => m.delete(7500));

        if (commands.includes(args[0])) {
            let command = args[0];
            let bool;

            if (args[1] === "true" || args[1] === "enable") bool = true;
            if (args[1] === "false" || args[1] === "disable") bool = false;

            db.updateOne({ guildID: guildID, 'commands.name': command }, {
                $set: { 'commands.$.status': bool }
            }).catch(err => console.log(err));

            const embed = new RichEmbed()
                .setColor("#0efefe")
                .setThumbnail(message.member.displayAvatarURL)
                .setFooter(message.member.displayName, message.author.displayAvatarURL)
                .setTimestamp()
                .setDescription(stripIndents`**> Command Toggled by:** ${message.member.user.username} (${message.member.id})
             **> Command Toggled:** ${args[0]}`);

            logChannel.send(embed);

            return message.reply("Toggling command... this may take a second...").then(m => m.delete(7500));
        }
    }
}