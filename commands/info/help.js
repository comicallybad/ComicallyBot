const { del, getCommandStatus } = require("../../functions.js");
const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");

module.exports = {
    name: "help",
    aliases: ["h"],
    category: "info",
    description: "Returns all commands, returns all commands in a category, or returns a specific command's information.",
    permissions: "member",
    usage: "[command | alias | category]",
    run: async (client, message, args) => {
        // If there's an arg found
        // Send the info of that command found
        // If no info found, return not found embed.
        if (args[0]) {
            return getSpecific(client, message, args[0]);
        } else {
            // Otherwise send all the commands available
            // Without the cmd info
            return getAll(client, message);
        }
    }
}

async function getAll(client, message) {
    const embed = new MessageEmbed()
        .setColor("#0efefe")
        .setTimestamp();

    // Map all the commands
    // with the specific category
    const commands = (category) => {
        return client.commands
            .filter(cmd => cmd.category === category)
            .map(cmd => ` \`${prefix}${cmd.name}\``)
            .join(",");
    }

    // Map all the categories
    const info = client.categories
        .filter(cat => cat !== "owner")
        .map(cat => stripIndents`**${cat[0].toUpperCase() + cat.slice(1)}** \n${commands(cat)}`)
        .reduce((string, category) => string + "\n" + category);

    return message.channel.send(embed.setDescription(info)).then(m => del(m, 30000));
}

function getSpecific(client, message, input) {
    const embed = new MessageEmbed()

    // Get the cmd by the name or alias
    const cmd = client.commands.get(input.toLowerCase()) || client.commands.get(client.aliases.get(input.toLowerCase()));
    const cat = client.categories;

    let info = `No information found for command **${input.toLowerCase()}**`;

    if (cmd) {
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

            return message.channel.send(embed.setColor("#0efefe").setDescription(info)).then(m => del(m, 30000));
        });
    } else if (cat.includes(input.toLowerCase())) {
        const cmds = client.commands
            .filter(cmd => cmd.category === input.toLowerCase())
            .map(cmd => ` \`${prefix}${cmd.name}\``)
            .join(",");

        info = `**${input[0].toUpperCase() + input.slice(1).toLowerCase()}** \n ${cmds}`;

        return message.channel.send(embed.setColor("#0efefe").setDescription(info)).then(m => del(m, 30000));
    } else {
        // If no cmd is found, send not found embed
        return message.channel.send(embed.setColor("#ff0000").setDescription(info)).then(m => del(m, 30000));
    }
}