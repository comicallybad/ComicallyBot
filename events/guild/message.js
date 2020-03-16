const { del, getCommandStatus, hasPermissions } = require("../../functions.js");
const { addCoins } = require("../../dbFunctions.js");

module.exports = async (client, message) => {
    if (message.author.bot) return;
    if (!message.guild) return;

    addCoins(message, client)

    if (!message.content.startsWith(prefix) && !message.content.startsWith("<@!492495421822730250>")) return;
    if (!message.member) message.member = await message.guild.fetchMember(message);

    function getArgs() {
        return message.content.startsWith(prefix)
            ? message.content.slice(prefix.length).trim().split(/ +/g) : message.content.slice("<@!492495421822730250>".length).trim().split(/ +/g);
    }

    const args = getArgs();
    const cmd = args.shift().toLowerCase();

    if (cmd.length === 0) return;

    let command = client.commands.get(cmd);
    if (!command) command = client.commands.get(client.aliases.get(cmd));

    if (command) {
        del(message, 0)

        if (command.category !== 'command') {
            getCommandStatus(message, command.name).then(function (res) {
                if (!res) message.reply("Command disabled").then(m => del(m, 7500));
                if (res) hasPermissions(message, command.permissions).then(async function (res) {
                    if (!res) message.reply("You do not have permissions for this command.").then(m => del(m, 7500));
                    if (res) command.run(client, message, args);
                });
            });
        } else {
            hasPermissions(message, command.permissions).then(async function (res) {
                if (!res) message.reply("You do not have permissions for this command.").then(m => del(m, 7500));
                if (res) command.run(client, message, args);
            });
        }
    }
}