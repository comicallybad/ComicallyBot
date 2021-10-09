const { MessageEmbed } = require("discord.js");
const xp = require("../../schemas/xp.js")

module.exports = async (client, data) => {
    activities = [`${client.guilds.cache.size} servers!`, `${client.channels.cache.size} channels!`, `${client.users.cache.size} users!`], i = 0;
    let userID = data.user.id;
    let guildID = data.guild.id;

    if (data.user.id !== client.user.id) {
        if (data.guild.channels) {
            let logChannel = await data.guild.channels.cache.find(c => c.name.includes("mod-logs")) || undefined;

            if (logChannel) {
                const embed = new MessageEmbed()
                    .setColor("#0efefe")
                    .setTitle("User Left")
                    .setThumbnail(data.user.displayAvatarURL())
                    .setDescription(`${data.user} ${data.user.tag}`)
                    .setFooter(`ID: ${data.user.id}`)
                    .setTimestamp()

                logChannel.send(embed).catch(err => err);
            }
        }
    }

    xp.deleteOne({ guildID: guildID, userID: userID }, {
    }).catch(err => console.log(err))
}