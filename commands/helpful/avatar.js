const { del } = require("../../functions.js")
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "avatar",
    aliases: ["av", "profilepic"],
    category: "helpful",
    description: "Responds with an embed of a users avatar.",
    permissions: "member",
    usage: "[@user | userID]",
    run: async (client, message, args) => {
        if (!args[0]) {
            const embed = new MessageEmbed()
                .setAuthor(`${message.member.user.tag}`, `${message.author.displayAvatarURL()}`)
                .setColor("#000000")
                .setTitle(`**Avatar**`)
                .setImage(`${message.author.displayAvatarURL({ size: 4096, dynamic: true })}`);
            return message.channel.send(embed);
        } else {
            let member = message.mentions.members.first() || await message.guild.members.fetch(args[0]).catch(() => { return undefined });
            if (!member) return message.reply("User not found.").then(m => del(m, 7500));
            else {
                const embed = new MessageEmbed()
                    .setAuthor(`${member.user.tag}}`, `${member.user.displayAvatarURL()}`)
                    .setColor("#000000")
                    .setTitle(`**Avatar**`)
                    .setImage(`${member.user.displayAvatarURL({ size: 4096, dynamic: true })}`);
                return message.channel.send(embed);
            }
        }
    }
}