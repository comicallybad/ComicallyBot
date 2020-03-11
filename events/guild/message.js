const { del, getCommandStatus, hasPermissions } = require("../../functions.js");
const { addCoins } = require("../../dbFunctions.js");

module.exports = async (client, message) => {
    if (message.author.bot) return;
    if (!message.guild) return;

    addCoins(message)

    if (!message.content.startsWith(prefix)) return;
    if (!message.member) message.member = await message.guild.fetchMember(message);

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
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