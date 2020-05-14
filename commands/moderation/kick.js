const { del, promptMessage } = require("../../functions.js");
const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");

module.exports = {
    name: "kick",
    category: "moderation",
    description: "Kick a member.",
    permissions: "moderator",
    usage: "<mention | id>",
    run: async (client, message, args) => {
        const logChannel = message.guild.channels.cache.find(c => c.name === "mod-logs") || message.channel;

        if (!message.guild.me.hasPermission("KICK_MEMBERS"))
            return message.reply("I don't have permission to kick members!").then(m => del(m, 7500));

        let toKick = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!toKick) return message.reply("Please supply a user to be kicked!").then(m => del(m, 7500));

        if (toKick.id === message.author.id)
            return message.reply("You can't kick yourself...").then(m => del(m, 7500));

        if (!toKick.kickable)
            return message.reply("I can't kick that person due to role hierarchy, I suppose.").then(m => del(m, 7500));

        let reason = args.slice(1).join(" ")
        if (!reason) reason = "No reason given!"

        const embed = new MessageEmbed()
            .setColor("#ff0000")
            .setTitle("User Kicked")
            .setThumbnail(toKick.user.displayAvatarURL())
            .setFooter(message.member.displayName, message.author.displayAvatarURL())
            .setTimestamp()
            .setDescription(stripIndents`
            **Kicked member: ${toKick} (${toKick.id})**
            **Kicked by: ${message.member}**
            **Reason: ${reason}**`);

        const promptEmbed = new MessageEmbed()
            .setColor("GREEN")
            .setAuthor(`This verification becomes invalid after 30s.`)
            .setDescription(`Do you want to kick ${toKick}?`)

        // Send the message
        await message.channel.send(promptEmbed).then(async msg => {
            // Await the reactions and the reaction collector
            const emoji = await promptMessage(msg, message.author, 30, ["✅", "❌"]);

            // The verification stuffs
            if (emoji === "✅") {
                del(msg, 0);

                toKick.kick(reason).then(() => {
                    toKick.send(`Hello, you have been **kicked** in ${message.guild.name} for: **${reason}**`).catch(err => err); //in case DM's are closed
                    message.reply(`${toKick.user.username}(${toKick.user.id}) was successfully kicked.`).then(m => del(m, 7500));
                }).catch(err => {
                    if (err) return message.reply(`There was an error attempting to kick ${toKick} ${err}`).then(m => del(m, 7500));
                });

                logChannel.send(embed);
            } else if (emoji === "❌") {
                del(msg, 0);
                message.reply(`Kick cancelled.`).then(m => del(m, 7500));
            }
        });
    }
};