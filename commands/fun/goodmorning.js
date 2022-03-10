const { s, r, del } = require("../../functions.js");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "goodmorning",
    aliases: ["gm"],
    category: "fun",
    description: "Sends a cute goodmorning message.",
    permissions: "member",
    usage: "[Give a goodmorning message]",
    run: async (client, message, args) => {
        const embed = new MessageEmbed()
            .setFooter({ text: `Message from: ${message.member.displayName}`, iconURL: message.member.user.displayAvatarURL() })
            .setTimestamp();

        if (!args[0]) {
            embed
                .setColor(message.member.displayHexColor === '#000000' ? '#ffffff' : message.member.displayHexColor)
                .setThumbnail(message.author.displayAvatarURL())
                .addField('Goodmorning Message:', `Goodmorning ${message.member.displayName} rise and shine!`)

            return s(message.channel, '', embed);
        }
        if (args[0]) {
            let member = message.mentions.members.first() || await message.guild.members.fetch(args[0]).catch(() => { return undefined });
            if (!member) member = message.member;

            if (member.id !== message.member.id && args[1]) {
                if (args.slice(1, args.length).join(' ').length >= 1024)
                    return r(message.channel, message.author, "You can only use a string less than 1024 characters!").then(m => del(m, 7500));
                else {
                    embed
                        .setColor(member.displayHexColor === '#000000' ? '#ffffff' : member.displayHexColor)
                        .setThumbnail(member.user.displayAvatarURL())
                        .addField('Goodmorning Message:', `${args.slice(1, args.length).join(' ')}`);

                    return s(message.channel, '', embed);
                }
            } else if (member.id == message.member.id && args[0]) {
                if (args.join(' ').length >= 1024)
                    return r(message.channel, message.author, "You can only use a string less than 1024 characters!").then(m => del(m, 7500));
                else {
                    embed
                        .setColor(member.displayHexColor === '#000000' ? '#ffffff' : member.displayHexColor)
                        .setThumbnail(message.member.user.displayAvatarURL())
                        .addField('Goodmorning Message:', `${args.join(' ')}`);

                    return s(message.channel, '', embed);
                }
            } else {
                embed
                    .setColor(member.displayHexColor === '#000000' ? '#ffffff' : member.displayHexColor)
                    .setThumbnail(member.user.displayAvatarURL())
                    .addField('Goodmorning Message:', `Goodmorning ${member.displayName} rise and shine!`);

                return s(message.channel, '', embed);
            }
        }
    }
}