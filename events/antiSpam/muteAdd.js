const { s } = require('../../functions.js');
const { MessageEmbed } = require('discord.js');
const { stripIndents } = require("common-tags");

module.exports = (client, member) => {
    client.antiSpam.cache.messages.forEach(async msg => {
        let channel = await member.guild.channels.cache.get(msg.channelID);
        let message = await channel.messages.fetch(msg.messageID);
        del(message, 0);
    });
    const logChannel = member.guild.channels.cache.find(c => c.name.includes("mod-logs"));
    if (logChannel) {
        const embed = new MessageEmbed()
            .setColor("#ff0000")
            .setTitle("Member Timed Out")
            .setThumbnail(member.guild.me.user.displayAvatarURL())
            .setFooter({ text: member.guild.me.displayName, iconURL: member.guild.me.user.displayAvatarURL() })
            .setTimestamp()
            .setDescription(stripIndents`
            **Timed Out Member:** ${member} (${member.id})
            **Timed Out By:** ${member.guild.me}
            **Reason:** Spam`)

        s(logChannel, '', embed);
    }
    setTimeout(() => {
        const embed2 = new MessageEmbed()
            .setColor("#00ff00")
            .setTitle("Member Timeout Removed")
            .setThumbnail(member.guild.me.user.displayAvatarURL())
            .setFooter({ text: member.guild.me.displayName, iconURL: member.guild.me.user.displayAvatarURL() })
            .setTimestamp()
            .setDescription(stripIndents`
            **Timed Out Member:** ${member} (${member.id})
            **Timeout Removed By:** ${member.guild.me}
            **Reason:** 10 Minute mute expired`)
        if (logChannel) return s(logChannel, '', embed2);
    }, 300000)
}