const { s, del } = require("../../functions.js");
const db = require('../../schemas/db.js');
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "removeverificationrole",
    aliases: ["rmverifyrole"],
    category: "verification",
    description: "Removes verification role to be given after using the verify command.",
    permissions: "moderator",
    usage: "<@role | role ID>",
    run: (client, message, args) => {
        const logChannel = message.guild.channels.cache.find(c => c.name.includes("mod-logs")) || message.channel;
        let guildID = message.guild.id;

        db.findOne({ guildID: guildID }, (err, exists) => {
            if (exists) {
                exists.verificationRole = [];
                exists.save().catch(err => console.log(err));

                const embed = new MessageEmbed()
                    .setColor("#0efefe")
                    .setTitle("Verification Role Removed")
                    .setThumbnail(message.author.displayAvatarURL())
                    .setFooter(message.member.displayName, message.author.displayAvatarURL())
                    .setTimestamp()
                    .setDescription(`**Verification Role Removed by:** ${message.member.user}`);

                s(logChannel, '', embed).catch(err => err);

                return message.reply("Removing verification role... this may take a second...").then(m => del(m, 7500));
            } else return message.reply("Role was never added, or it was already removed.").then(m => del(m, 7500));
        }).catch(err => console.log(err))
    }
}