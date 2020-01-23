const { getMember } = require("../../functions.js");
const { RichEmbed } = require("discord.js");

module.exports = {
    name: "goodnight",
    aliases: ["gn"],
    category: "fun",
    description: "Sends a cute goodnight message",
    permissions: "member",
    run: (client, message, args) => {
        if (message.deletable) message.delete();
        const member = getMember(message, args.join(" "));

        const embed = new RichEmbed()
            .setFooter(member.displayName, member.user.displayAvatarURL)
            .setThumbnail(member.user.displayAvatarURL)
            .setColor(member.displayHexColor === '#000000' ? '#ffffff' : member.displayHexColor)
            .addField('Goodnight Message:', `Goodnight ${member.displayName} sleep tight`)
            .setTimestamp();

        message.channel.send(embed);
    }
}