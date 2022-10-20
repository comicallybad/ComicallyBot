const { s } = require('../../functions.js');
const { MessageEmbed } = require("discord.js");

module.exports = async (client, data) => {
    if (!data.guild) return;
    let logChannel = await data.guild.channels.cache.find(c => c.name.includes("mod-logs")) || undefined;

    if (logChannel) {
        const embed = new MessageEmbed()
            .setColor("#0efefe")
            .setTitle("Member Unbanned")
            .setThumbnail(data.user.displayAvatarURL())
            .setDescription(`${data.user} (${data.user.id})`)
            .setFooter({ text: `${data.user.tag}` })
            .setTimestamp()

        return s(logChannel, '', embed);
    }
}
