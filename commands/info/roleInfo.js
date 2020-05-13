const { del, findID } = require("../../functions.js");
const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");

module.exports = {
    name: "roleinfo",
    aliases: ["role", "inforole", "rolei"],
    category: "info",
    description: "Returns role information.",
    permissions: "member",
    usage: "[role name | id | mention]",
    run: async (client, message, args) => {
        let roleID;
        let roleNames = message.guild.roles.cache.map(role => role.name);
        let roleIDs = message.guild.roles.cache.map(role => role.id);
        let roles = message.guild.roles.cache;

        if (!args[0])
            return message.reply("Please provide a role to check.").then(m => del(m, 7500));

        if (message.mentions.roles.first()) {
            roleID = message.mentions.roles.first().id;
        } else if (findID(message, args[0], "role")) {
            roleID = findID(message, args[0], "role");
        } else if (roleNames.includes(args.join(" "))) {
            roleID = roleIDs[roleNames.indexOf(args.join(" "))];
        } else {
            return message.reply("Sorry, I could not find that role.").then(m => del(m, 7500));
        }

        let role = roles.filter(role => role.id == roleID).map(role => role)[0];

        const embed = new MessageEmbed()
            .setColor(`${role.hexColor}`)
            .setTitle(role.name)
            .addField("Role information:", stripIndents`
            **Role name: ${role.name}**
            **Role ID: ${role.id}**
            **Mentionable: ${role.mentionable}**
            **Hierarchy position: ${role.rawPosition + 1} (from bottom up)**
            **Number of users in role: ${role.members.size}**`)
            .setTimestamp()

        return message.reply(embed).then(m => del(m, 30000));
    }
}