const { MessageEmbed } = require("discord.js");

module.exports = async (client, guild, user) => {
    if (user.id !== client.user.id) {
        if (guild.channels) {
            let logChannel = await guild.channels.cache.find(c => c.name === "mod-logs" || undefined);

            if (logChannel) {
                const embed = new MessageEmbed()
                    .setColor("#0efefe")
                    .setTitle("User Banned")
                    .setThumbnail(user.displayAvatarURL())
                    .setDescription(`${user} ${user.tag}`)
                    .setFooter(`ID: ${user.id}`)
                    .setTimestamp()

                logChannel.send(embed);
            }
        }
    }
}
