const { s, r, del } = require("../../functions");
const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");

module.exports = {
    name: "nickname",
    aliases: ["nick"],
    category: "helpful",
    description: "Changes a user's nickname.",
    permissions: "moderator",
    usage: "<@user | userID> <nickname>",
    run: async (client, message, args) => {
        if (!args[0])
            return r(message.channel, message.author, "Please provide a user.").then(m => del(m, 7500));

        if (!args[1])
            return r(message.channel, message.author, "Please provide a new nickname.").then(m => del(m, 7500));

        const logChannel = message.guild.channels.cache.find(c => c.name.includes("mod-logs")) || message.channel;

        if (!message.guild.me.permissions.has("MANAGE_NICKNAMES"))
            return r(message.channel, message.author, "I don't have permission to manage nicknames!").then(m => del(m, 7500));

        let user = message.mentions.members.first() || await message.guild.members.fetch(args[0]);
        if (!user) return r(message.channel, message.author, "Please supply a user to be banned!").then(m => del(m, 7500));

        let nickName = args.splice(1).join(' ');

        const embed = new MessageEmbed()
            .setColor("#0efefe")
            .setTitle("Member Nickname Changed")
            .setThumbnail(user.user.displayAvatarURL())
            .setFooter({ text: message.member.displayName, iconURL: message.author.displayAvatarURL() })
            .setTimestamp()
            .setDescription(stripIndents`
            **Member changed:** ${user} (${user.id})
            **Nickname changed To:** ${nickName}
            **Nickname changed By:** ${message.author}`);

        return user.setNickname(nickName, '').then(() => {
            r(message.channel, message.author, "User's nickname was successfully changed.").then(m => del(m, 7500));
            return s(logChannel, '', embed);
        }).catch(err => r(message.channel, message.author, `There was an error changing nickname: ${err}`).then(m => del(m, 7500)));
    }
}