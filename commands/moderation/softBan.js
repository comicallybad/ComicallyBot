const { del, promptMessage } = require("../../functions.js");
const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");

module.exports = {
    name: "softban",
    aliases: ["sban"],
    category: "moderation",
    description: "Soft ban a member.",
    permissions: "moderator",
    usage: "<id | mention> [reason]",
    run: async (client, message, args) => {
        const logChannel = message.guild.channels.cache.find(c => c.name === "mod-logs") || message.channel;

        //User has permissions
        if (!message.member.hasPermission("BAN_MEMBERS"))
            return message.reply("You dont have the ban members permission to perform this command!").then(m => del(m, 7500));

        //Bot has permissions
        if (!message.guild.me.hasPermission("BAN_MEMBERS"))
            return message.reply("I dont have the permission to perform this command!").then(m => del(m, 7500));

        let banMember = message.mentions.members.first() || message.guild.members.cache.get(args[0])
        if (!banMember) return message.channel.send("Please provide a user to ban!")

        if (banMember.id === message.author.id)
            return message.reply("You can't ban yourself...").then(m => del(m, 7500));

        if (!banMember.bannable)
            return message.reply("I can't ban that person due to role hierarchy, I suppose.").then(m => del(m, 7500));

        let reason = args.slice(1).join(" ");
        if (!reason) reason = "No reason given!"

        const embed = new MessageEmbed()
            .setColor("#ff0000")
            .setThumbnail(banMember.user.displayAvatarURL())
            .setFooter(message.member.displayName, message.author.displayAvatarURL())
            .setTimestamp()
            .setDescription(stripIndents`**> Soft banned member:** ${banMember} (${banMember.id})
        **> Soft banned by:** ${message.member} (${message.member.id})
        **> Reason:** ${reason}`);

        const promptEmbed = new MessageEmbed()
            .setColor("GREEN")
            .setAuthor(`This verification becomes invalid after 30s.`)
            .setDescription(`Do you want to soft ban ${banMember}?`)

        // Send the message
        await message.channel.send(promptEmbed).then(async msg => {
            // Await the reactions and the reactioncollector
            const emoji = await promptMessage(msg, message.author, 30, ["✅", "❌"]);

            // Verification stuffs
            if (emoji === "✅") {
                del(msg, 0);

                //attempt ban and send message
                banMember.send(`Hello, you have been **soft banned** in ${message.guild.name} for: **${reason}**`).catch(err => console.log(err));
                message.guild.members.ban(banMember, { days: 1, reason: reason }).then(() =>
                    message.guild.members.unban(banMember.id, { reason: "Softban" })).catch(err => console.log(err))

                logChannel.send(embed);
            } else if (emoji === "❌") {
                del(msg, 0);
                message.reply(`Soft ban cancelled.`).then(m => del(m, 7500));
            }
        });
    }
}