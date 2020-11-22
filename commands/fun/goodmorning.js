const { getMember } = require("../../functions.js");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "goodmorning",
    aliases: ["gm"],
    category: "fun",
    description: "Sends a cute goodmorning message.",
    permissions: "member",
    usage: "[Give a goodmorning message]",
    run: (client, message, args) => {
        const embed = new MessageEmbed()
        if (args[1]) {
            embed.addField('Goodmorning Message:', `${args.join(' ')}`);
        } else embed.addField('Goodmorning Message:', `Goodmorning ${member.displayName} rise and shine!`)

        const member = getMember(message, args.join(" "));

        embed
            .setFooter(member.displayName, member.user.displayAvatarURL())
            .setThumbnail(member.user.displayAvatarURL())
            .setColor(member.displayHexColor === '#000000' ? '#ffffff' : member.displayHexColor)
            .setTimestamp();

        message.channel.send(embed);
    }
}