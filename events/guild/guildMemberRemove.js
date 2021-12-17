const { s } = require('../../functions.js');
const { MessageEmbed } = require("discord.js");
const xp = require("../../schemas/xp.js")

module.exports = async (client, data) => {
    activities = [`${client.guilds.cache.size} servers!`, `${client.channels.cache.size} channels!`, `${client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)} users!`], i = 0;
    let userID = data.user.id;
    let guildID = data.guild.id;

    if (data.user.id !== client.user.id) {
        if (data.guild.channels) {
            let logChannel = await data.guild.channels.cache.find(c => c.name.includes("mod-logs")) || undefined;

            if (logChannel) {
                const embed = new MessageEmbed()
                    .setColor("#0efefe")
                    .setTitle("Member Left")
                    .setThumbnail(data.user.displayAvatarURL())
                    .setDescription(`${data.user} ${data.user.tag}`)
                    .setFooter(`ID: ${data.user.id}`)
                    .setTimestamp()

                s(logChannel, '', embed).catch(err => err);
            }
        }
    }

    xp.deleteOne({ guildID: guildID, userID: userID }, {
    }).catch(err => console.log(err))
}