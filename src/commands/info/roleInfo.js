const { s, r, del, findID } = require("../../../utils/functions/functions.js");
const { EmbedBuilder } = require("discord.js");
const { stripIndents } = require("common-tags");

module.exports = {
    name: "roleinfo",
    aliases: ["role"],
    category: "info",
    description: "Returns role information.",
    permissions: "member",
    usage: "[@role | roleID | rolename]",
    run: async (client, message, args) => {
        let roleID;
        let roleNames = message.guild.roles.cache.map(role => role.name);
        let roleIDs = message.guild.roles.cache.map(role => role.id);

        if (!args[0])
            return r(message.channel, message.author, "Please provide a role to check.").then(m => del(m, 7500));

        if (message.mentions.roles.first()) {
            roleID = message.mentions.roles.first().id;
        } else if (await findID(message, args[0])) {
            roleID = await findID(message, args[0]);
        } else if (roleNames.includes(args.join(" "))) {
            roleID = roleIDs[roleNames.indexOf(args.join(" "))];
        } else {
            return r(message.channel, message.author, "Sorry, I could not find that role.").then(m => del(m, 7500));
        }

        let role = await message.guild.roles.fetch(roleID);

        const embed = new EmbedBuilder()
            .setColor(`${role.hexColor}`)
            .setTitle(role.name)
            .addFields({
                name: "Role information:",
                value: stripIndents`
                **Role name: ${role.name}**
                **Role ID: ${role.id}**
                **Mentionable: ${role.mentionable}**
                **Hierarchy position: ${role.rawPosition + 1} (from bottom up)**
                **Number of users in role: ${role.members.size}**`
            })
            .setTimestamp()

        return s(message.channel, '', embed).then(m => del(m, 30000));
    }
}