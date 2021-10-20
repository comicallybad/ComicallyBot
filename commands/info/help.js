const { del, getCommandStatus } = require("../../functions.js");
const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");

module.exports = {
    name: "help",
    aliases: ["h", "commands"],
    category: "info",
    description: "Returns all commands, returns all commands in a category, or returns a specific command's information.",
    permissions: "everyone",
    usage: "[command | alias | category]",
    run: async (client, message, args) => {
        if (args[0]) return getSpecific(client, message, args[0]);
        else return getAll(client, message);
    }
}

async function getAll(client, message) {
    const embed = new MessageEmbed()
        .addField("Additional information",
            `Members must be added to gain access to \`member\` commands via \`${prefix}addmember\`.\n` +
            `Moderators must be added to gain access to \`moderator\` commands via \`${prefix}addmod\`.\n ` +
            `Use \`${prefix}help <category | command name | alias>\` to view help/permissions for commands.\n` +
            `Add a \`🛑\` reaction to bot messages to prevent them from being deleted.`)
        .setColor("#0efefe")
        .setTitle("Help")
        .setTimestamp();

    const info = client.categories
        .filter(cat => cat !== "owner")
        .map(cat => stripIndents`**${cat[0].toUpperCase() + cat.slice(1)}** \n\`${prefix}help ${cat}\` to view ${cat} commands`)
        .reduce((string, category) => string + "\n" + category);

    return message.channel.send(embed.setDescription(info)).then(m => del(m, 30000));
}

function getSpecific(client, message, input) {
    const embed = new MessageEmbed()
    const cmd = client.commands.get(input.toLowerCase()) || client.commands.get(client.aliases.get(input.toLowerCase()));
    const cat = client.categories;

    let info = `No information found for command **${input.toLowerCase()}**`;

    if (cmd) {
        if (cmd.name) info = `**Command name**: \`${cmd.name}\``;
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
        }).catch(err => console.log(`There was an error in help ${err}`));;
    } else if (cat.includes(input.toLowerCase())) {
        const cmds = client.commands
            .filter(cmd => cmd.category === input.toLowerCase())
            .map(cmd => ` \`${prefix}${cmd.name}\``)
            .join(",");

        info = `**${input[0].toUpperCase() + input.slice(1).toLowerCase()}** \n ${cmds}`;
        return message.channel.send(embed.setColor("#0efefe").setDescription(info)).then(m => del(m, 30000));
    } else return message.channel.send(embed.setColor("#ff0000").setDescription(info)).then(m => del(m, 30000));
}