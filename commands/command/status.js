const db = require('../../schemas/db.js');
const { RichEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");

module.exports = {
    name: "status",
    aliases: ["commandstatus", "commands"],
    category: "command",
    description: "Show command status.",
    permissions: "moderator",
    run: (client, message, args) => {
        let guildID = message.guild.id;
        db.findOne({ guildID: guildID }, (err, exists) => {
            if (err) console.log(err)
            if (!exists) return message.reply("Error in database")
            if (exists) {
                const embed = new RichEmbed()
                    .setColor("#0efefe")
                    .setTimestamp()

                let clientCommandsName = client.commands.map(cmd => cmd.name)
                let clientCommandsCategory = client.commands.map(cmd => cmd.category)

                const commands = (category) => {
                    return exists.commands
                        .filter(function (cmd) {
                            if (clientCommandsName.includes(cmd.name)
                                && clientCommandsCategory[(clientCommandsName.indexOf(cmd.name))] === category
                                && category !== "command" && cmd.name !== "help")
                                return commands.name
                        }).map(function (cmd) {
                            if (cmd.status === false) return `-\`${prefix}${cmd.name}\`❌`;
                            if (cmd.status === true) return ` \`${prefix}${cmd.name}\`✅`;
                        }).join(",");
                }

                const info = client.categories
                    .filter(cat => cat !== "command")
                    .map(cat => stripIndents`**${cat[0].toUpperCase() + cat.slice(1)}** \n${commands(cat)}`)
                    .reduce((string, category) => string + "\n" + category);

                return message.channel.send(embed.setDescription(info)).then(m => m.delete(30000));
            }
        });
    }
}