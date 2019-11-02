const { RichEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");
const { getCommandStatus } = require("../../functions");

module.exports = {
    name: "help",
    aliases: ["h"],
    category: "info",
    description: "Returns all commands, or one specific command info",
    permissions: "member",
    usage: "[command | alias]",
    run: async (client, message, args) => {
        if (message.deletable) message.delete();
        // If there's an arg found
        // Send the info of that command found
        // If no info found, return not found embed.
        if (args[0]) {
            return getCMD(client, message, args[0]);
        } else {
            // Otherwise send all the commands available
            // Without the cmd info
            return getAll(client, message);
        }
    }
}

async function getAll(client, message) {
    const embed = new RichEmbed()
        .setColor("#0efefe")
        .setTimestamp();

    // Map all the commands
    // with the specific category
    const commands = (category) => {
        return client.commands
            .filter(cmd => cmd.category === category)
            .map(cmd => `- \`${cmd.name}\``)
            .join("\n");
    }

    // Map all the categories
    const info = client.categories
        .map(cat => stripIndents`**${cat[0].toUpperCase() + cat.slice(1)}** \n${commands(cat)}`)
        .reduce((string, category) => string + "\n" + category);

    return message.channel.send(embed.setDescription(info)).then(m => m.delete(30000));
}

function getCMD(client, message, input) {
    const embed = new RichEmbed()

    // Get the cmd by the name or alias
    const cmd = client.commands.get(input.toLowerCase()) || client.commands.get(client.aliases.get(input.toLowerCase()));

    let info = `No information found for command **${input.toLowerCase()}**`;

    // If no cmd is found, send not found embed
    if (!cmd) {
        return message.channel.send(embed.setColor("#ff0000").setDescription(info)).then(m => m.delete(30000));
    }

    // Add all cmd info to the embed
    if (cmd.name) info = `**Command name**: ${cmd.name}`;
    if (cmd.aliases) info += `\n**Aliases**: ${cmd.aliases.map(a => `\`${a}\``).join(", ")}`;
    if (cmd.description) info += `\n**Description**: ${cmd.description}`;
    if (cmd.permissions) info += `\n**Permissions**: ${cmd.permissions}`
    if (cmd.usage) {
        info += `\n**Usage**: ${cmd.usage}`;
        embed.setFooter(`Syntax: <> = required, [] = optional`);
    }
    getCommandStatus(message, cmd.name).then(async function (res) {
        if (res === false) info += '\n**Status**: ❌';
        if (res === true) info += '\n**Status**: ✅';

        return message.channel.send(embed.setColor("#0efefe").setDescription(info)).then(m => m.delete(30000));
    });
}