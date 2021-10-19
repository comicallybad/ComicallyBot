const { del } = require("../../functions.js");
const db = require('../../schemas/db.js');
const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");

module.exports = {
    name: "commandstatus",
    aliases: ["status"],
    category: "command",
    description: "Show command status.",
    permissions: "moderator",
    run: (client, message, args) => {
        let guildID = message.guild.id;
        db.findOne({ guildID: guildID }, (err, exists) => {
            if (err) console.log(err)
            if (!exists) return message.reply("Error in database")
            if (exists) {
                const embed = new MessageEmbed()
                    .setColor("#0efefe")
                    .setTitle("Status")
                    .setTimestamp()

                let clientCommandsName = client.commands.map(cmd => cmd.name)
                let clientCommandsCategory = client.commands.map(cmd => cmd.category)

                const commands = (category) => {
                    return exists.commands
                        .filter(function (cmd) {
                            if (clientCommandsName.includes(cmd.name)
                                && clientCommandsCategory[(clientCommandsName.indexOf(cmd.name))] === category
                                && category !== "command" && category !== "owner" && cmd.name !== "help")
                                return commands.name
                        }).map(function (cmd) {
                            if (cmd.status === false) return `-\`${prefix}${cmd.name}\`❌`;
                            if (cmd.status === true) return ` \`${prefix}${cmd.name}\`✅`;
                        }).join(",");
                }

                const info = client.categories
                    .filter(cat => cat !== "command" && cat !== "owner" && cat !== "support")
                    .map(cat => stripIndents`**${cat[0].toUpperCase() + cat.slice(1)}** \n${commands(cat)}`)
                    .reduce((string, category) => string + "\n" + category);

                return message.channel.send(embed.setDescription(info)).then(m => del(m, 30000));
            }
        });
    }
}