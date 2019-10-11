const db = require('../../schemas/db.js');
const { RichEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");
const { hasPermissions } = require("../../functions.js");

module.exports = {
    name: "status",
    aliases: ["commandstatus", "commands"],
    category: "command",
    description: "Enable or disable commands",
    permissions: "moderator",
    usage: prefix + "status",
    run: (client, message, args) => {
        hasPermissions(message, "moderator").then(async function (res) {
            if (!res) message.reply("You do not have permissions for this command.").then(m => m.delete(7500))
            if (res) {
                let guildID = message.guild.id;
                db.findOne({ guildID: guildID }, (err, exists) => {
                    if (err) console.log(err)
                    if (!exists) return message.reply("Error in database")
                    if (exists) {
                        const embed = new RichEmbed()
                            .setColor("#0efefe")

                        let clientCommandsName = client.commands.map(cmd => cmd.name)
                        let clientCommandsCategory = client.commands.map(cmd => cmd.category)

                        const commands = (category) => {
                            return exists.commands
                                .filter(function (cmd) {
                                    if (clientCommandsName.includes(cmd.name)
                                        && clientCommandsCategory[(clientCommandsName.indexOf(cmd.name))] === category
                                        && category !== "command")
                                        return commands.name
                                }).map(function (cmd) {
                                    if (cmd.status === false) return `- \`${cmd.name}\`❌`;
                                    if (cmd.status === true) return `- \`${cmd.name}\`✅`;
                                }).join("\n");
                        }

                        const info = client.categories
                            .filter(cat => cat !== "command")
                            .map(cat => stripIndents`**${cat[0].toUpperCase() + cat.slice(1)}** \n${commands(cat)}`)
                            .reduce((string, category) => string + "\n" + category);

                        return message.channel.send(embed.setDescription(info));
                    }
                })
                if (message.deletable) message.delete();
            }
        })
    }
}