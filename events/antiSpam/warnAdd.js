const { MessageEmbed } = require('discord.js');
const { stripIndents } = require("common-tags");

module.exports = (client, member) => {
    const logChannel = member.guild.channels.cache.find(c => c.name === "mod-logs");
    if (logChannel) {
        const embed = new MessageEmbed()
            .setColor("#ff0000")
            .setTitle("User Warned")
            .setThumbnail(member.guild.me.user.displayAvatarURL())
            .setFooter(member.guild.me.displayName, member.guild.me.user.displayAvatarURL())
            .setTimestamp()
            .setDescription(stripIndents`
            **Warned member:** ${member} (${member.id})
            **Warned by:** ${member.guild.me}
            **Reason:** Spam`)
        logChannel.send(embed);
    }
    setTimeout(() => {
        let userIndex = client.antiSpam.cache.warnedUsers.indexOf(`${member.id}`);
        client.antiSpam.cache.warnedUsers.splice(userIndex, 1);
    }, 15000)
}