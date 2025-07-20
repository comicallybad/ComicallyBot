const { PermissionFlagsBits } = require("discord.js")
const { del } = require("../../../utils/functions/functions.js");

module.exports = async (client, message) => {
    if (!message || !message.guild || message.author.bot) return;
    if (!message.member) message.member = await message.guild.members.fetch(message).catch(err => err);
    if (message.guild.members.me.isCommunicationDisabled()) return;

    checkOwnerCommand(client, message);
}

function checkOwnerCommand(client, message) {
    if (!message.content.startsWith("_") || !message.content.startsWith(`<@${client.user.id}>`) && message.author.id !== process.env.USERID) return;

    const args = message.content.startsWith("_")
        ? message.content.slice("_".length).trim().split(/ +/g)
        : message.content.slice(`<@${client.user.id}>`.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();

    if (cmd.length === 0) return;

    const command = client.commands.get(cmd) || client.commands.get(client.aliases.get(cmd));
    if (!command) return;

    const channelPermissions = message.channel.permissionsFor(message.guild.members.me);

    if (!channelPermissions?.has(PermissionFlagsBits.ViewChannel)) return;

    if (!channelPermissions?.has(PermissionFlagsBits.SendMessages))
        return message.author.send("I am missing permissions to `SEND_MESSAGES`").catch(err => err);

    del(message, 0);

    try {
        return command.run(client, message, args);
    } catch (err) {
        console.log(`Error running ${command}: ${err.stack}`);
    }
    return;
}