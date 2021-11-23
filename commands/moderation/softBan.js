const { del, promptMessage } = require("../../functions.js");
const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");

module.exports = {
    name: "softban",
    aliases: ["sban"],
    category: "moderation",
    description: "Soft ban a member.",
    permissions: "moderator",
    usage: "<@user | userID> [reason]",
    run: async (client, message, args) => {
        const logChannel = message.guild.channels.cache.find(c => c.name.includes("mod-logs")) || message.channel;

        if (!message.guild.me.hasPermission("BAN_MEMBERS"))
            return message.reply("I don't have the permission to perform this command!").then(m => del(m, 7500));

        if (!args[0])
            return message.reply("Please provide a user to softban.").then(m => del(m, 7500));

        let toBan = message.mentions.members.first() || await message.guild.members.cache.get(args[0]);
        if (!toBan) toBan = await client.users.fetch(args[0]);
        if (!toBan) return message.reply("Could not find that user!").then(m => del(m, 7500));

        if (toBan.id === message.author.id)
            return message.reply("You can't softban yourself...").then(m => del(m, 7500));

        let reason = args.slice(1).join(" ")
        if (!reason) reason = "No reason given!"

        const embed = new MessageEmbed()
            .setColor("#ff0000")
            .setTitle("Member SoftBanned")
            .setThumbnail(toBan.displayAvatarURL())
            .setFooter(message.member.displayName, message.author.displayAvatarURL())
            .setTimestamp()
            .setDescription(stripIndents`
                **SoftBanned member:** ${toBan} (${toBan.id})
                **SoftBanned by:** ${message.member}
                **Reason:** ${reason}`);

        const promptEmbed = new MessageEmbed()
            .setColor("GREEN")
            .setAuthor(`This verification becomes invalid after 30s.`)
            .setDescription(`Do you want to softban ${toBan}?`)

        await message.channel.send(promptEmbed).then(async msg => {
            const emoji = await promptMessage(msg, message.author, 30, ["✅", "❌"]);

            if (emoji === "✅") {
                del(msg, 0);

                message.guild.members.ban(toBan.id).then(() => {
                    message.guild.members.unban(toBan.id)
                    toBan.send(`Hello, you have been **soft banned** in ${message.guild.name} for: **${reason}**`).catch(err => err) //in case DM's are closed
                    message.reply(`${toBan.username}(${toBan.id}) was successfully soft banned.`).then(m => del(m, 7500));
                    return logChannel.send(embed).catch(err => err);
                }).catch(err => {
                    if (err) return message.reply(`There was an error attempting to softban ${toBan} ${err}`).then(m => del(m, 7500));
                });
            } else if (emoji === "❌") {
                del(msg, 0);
                return message.reply(`Softban cancelled.`).then(m => del(m, 7500));
            } else {
                return del(msg, 0)
            }
        }).catch(err => err);
    }
}