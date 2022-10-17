const { s } = require('../../functions.js');
const { MessageEmbed } = require("discord.js");

module.exports = async (client, guild, member) => {
    if (!guild.guild.me.permissions.has("VIEW_AUDIT_LOG"))
        return;

    if (guild.channels) {
        let logChannel = await guild.channels.cache.find(c => c.name.includes("mod-logs")) || undefined;

        if (logChannel) {
            const embed = new MessageEmbed()
                .setColor("#0efefe")
                .setTitle("Member Unbanned")
                .setThumbnail(member.displayAvatarURL())
                .setDescription(`Member Unbanned: ${member} (${member.id})`)
                .setFooter({ text: `ID: ${member.id}` })
                .setTimestamp()

            return s(logChannel, '', embed);
        }
    }
}
