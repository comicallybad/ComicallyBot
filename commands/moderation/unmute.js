const { del, promptMessage } = require("../../functions.js");
const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");

module.exports = {
    name: "unmute",
    category: "moderation",
    description: "Unmute a member.",
    permissions: "moderator",
    usage: "<id | mention>",
    run: async (client, message, args) => {
        const logChannel = message.guild.channels.cache.find(c => c.name === "mod-logs") || message.channel;

        if (!message.guild.me.hasPermission("MANAGE_ROLES"))
            return message.reply("I don't have permission to manage roles!").then(m => del(m, 7500));

        let mutee = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!mutee) return message.reply("Please supply a user to be muted!").then(m => del(m, 7500));

        if (mutee.id === message.author.id)
            return message.reply("You can't unmute yourself...? This should not even be possible if you are muted...").then(m => del(m, 7500));

        let reason = args.slice(1).join(" ");
        if (!reason) reason = "No reason given"

        let muterole = message.guild.roles.cache.find(r => r.name === "Muted")
        if (!muterole) return message.reply("There is no mute role to remove!").then(m => del(m, 7500));

        const embed = new MessageEmbed()
            .setColor("#ff0000")
            .setThumbnail(mutee.user.displayAvatarURL())
            .setFooter(message.member.displayName, message.author.displayAvatarURL())
            .setTimestamp()
            .setDescription(stripIndents`**> Unmuted member:** ${mutee} (${mutee.id})
            **> Unmuted by:** ${message.member}
            **> Reason:** ${reason}`);

        const promptEmbed = new MessageEmbed()
            .setColor("GREEN")
            .setAuthor(`This verification becomes invalid after 30s.`)
            .setDescription(`Do you want to unmute ${mutee}?`)

        // Send the message
        await message.channel.send(promptEmbed).then(async msg => {
            // Await the reactions and the reactioncollector
            const emoji = await promptMessage(msg, message.author, 30, ["✅", "❌"]);

            // Verification stuffs
            if (emoji === "✅") {
                del(msg, 0);

                //remove role to the mentioned user and also send the user a dm explaing where and why they were unmuted
                mutee.roles.remove(muterole.id).then(() => {
                    mutee.send(`Hello, you have been **unmuted** in ${message.guild.name} for: **${reason}**`).catch(err => err); //in case DM's are closed
                    message.reply(`${mutee.user.username} was successfully unmuted.`).then(m => del(m, 7500));
                }).catch(err => {
                    if (err) return message.reply(`There was an error attempting to unmute ${mutee} ${err}`).then(m => del(m, 7500));
                });

                logChannel.send(embed);
            } else if (emoji === "❌") {
                del(msg, 0);
                message.reply(`Unmute cancelled.`).then(m => del(m, 7500));
            }
        });
    }
}