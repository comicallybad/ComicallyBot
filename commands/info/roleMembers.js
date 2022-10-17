const { s, r, e, del, findID, pageList } = require("../../functions.js");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "rolemembers",
    aliases: ["roleusers"],
    category: "info",
    description: "Returns users within a role.",
    permissions: "member",
    usage: "[@role | roleID | rolename]",
    run: async (client, message, args) => {
        let roleID;
        let roleNames = message.guild.roles.cache.map(role => role.name);
        let roleIDs = message.guild.roles.cache.map(role => role.id);
        let roles = message.guild.roles.cache;

        if (!args[0])
            return r(message.channel, message.author, "Please provide a role to check.").then(m => del(m, 7500));

        if (message.mentions.roles.first()) {
            roleID = message.mentions.roles.first().id;
        } else if (await findID(message, args[0])) {
            roleID = await findID(message, args[0]);
        } else if (roleNames.includes(args.join(" "))) {
            roleID = roleIDs[roleNames.indexOf(args.join(" "))];
        } else return r(message.channel, message.author, "Sorry, I could not find that role.").then(m => del(m, 7500));

        let guildRole = roles.filter(role => role.id == roleID).map(role => role)[0];

        let list = client.guilds.cache.get(message.guild.id);
        await list.members.fetch();
        let members = list.roles.cache.get(guildRole.id).members.map(m => m);

        const embed = new MessageEmbed()
            .setColor(guildRole.color)
            .setTitle(`${guildRole.name}: ${guildRole.members.size} members`)
            .setTimestamp()

        const m = await s(message.channel, '', embed);

        let array = members.map(member => `${member.user.username} (${member.user.id})`);

        if (array.length <= 10) {
            array.forEach((user, index) => {
                embed.addField(`Role Member: ${index + 1}`, `${user}`);
            });
            return e(m, m.channel, '', embed).then(del(m, 30000));
        }
        else return pageList(m, message.author, array, embed, "Role Member:", 10, 0);
    }
}