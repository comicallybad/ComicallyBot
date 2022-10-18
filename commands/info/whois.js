const { s, r, del, formatDate } = require("../../functions.js");
const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");

module.exports = {
    name: "whois",
    category: "info",
    description: "Returns user information.",
    permissions: "member",
    usage: "[@user | userID | user]",
    run: async (client, message, args) => {
        let member;
        if (args[0])
            member = message.mentions.members.first() || await message.guild.members.fetch(args[0]).catch(() => { return undefined });
        else member = message.member;

        if (!member)
            return r(message.channel, message.author, "Sorry, this user either doesn't exist, or they are not in the discord.").then(m => del(m, 7500));

        // Member variables
        const joined = formatDate(member.joinedAt);
        const roles = member.roles.cache
            .filter(r => r.id !== message.guild.id)
            .map(r => r).join(", ") || 'none';

        // User variables
        const created = formatDate(member.user.createdAt);

        const embed = new MessageEmbed()
            .setFooter({ text: member.displayName, iconURL: member.user.displayAvatarURL() })
            .setThumbnail(member.user.displayAvatarURL())
            .setColor(member.displayHexColor === '#000000' ? '#ffffff' : member.displayHexColor)
            .addFields({
                name: 'Member information:',
                value: stripIndents`
                **Display name: ${member.displayName}**
                **Joined at: ${joined}**
                **Roles: ${roles}**`
            })
            .addFields({
                name: 'User information:',
                value: stripIndents`
                **ID: ${member.user.id}**
                **Username: ${member.user.username}**
                **Tag: ${member.user.tag}**
                **Created at: ${created}**`
            })
            .setTimestamp();

        return s(message.channel, '', embed).then(m => del(m, 15000));
    }
}