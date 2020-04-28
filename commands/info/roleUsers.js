const { del, findID } = require("../../functions.js");
const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");

module.exports = {
    name: "roleusers",
    aliases: ["membersrole", "rolemembers", "usersrole"],
    category: "info",
    description: "Returns users within a role.",
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
        } else if (roleNames.includes(args[0])) {
            roleID = roleIDs[roleNames.indexOf(args[0])];
        } else {
            return message.reply("Sorry, I could not find that role.")
        }

        let role = roles.filter(role => role.id == roleID).map(role => role)[0];
        let members = role.members.map(user => user);

        const embed = new MessageEmbed()
            .setColor(role.color)
            .setTitle(role.name)
            .addField("Number of users in role: ", role.members.size)
            .setTimestamp()

        members.forEach(member => {
            embed.addField(`Role member: `, `${member.user.username} (${member.user.id})`)
        });

        return message.reply(embed).then(m => del(m, 30000));
    }
}