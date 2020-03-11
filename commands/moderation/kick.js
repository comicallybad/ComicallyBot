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

        // No args
        if (!args[0]) {
            return message.reply("Please provide a person to kick.")
                .then(m => del(m, 7500));
        }

        // No reason
        if (!args[1]) {
            return message.reply("Please provide a reason to kick.")
                .then(m => del(m, 7500));
        }

        // No author permissions
        if (!message.member.hasPermission("KICK_MEMBERS")) {
            return message.reply("❌ You do not have permissions to kick members. Please contact a staff member")
                .then(m => del(m, 7500));
        }

        // No bot permissions
        if (!message.guild.me.hasPermission("KICK_MEMBERS")) {
            return message.reply("❌ I do not have permissions to kick members. Please contact a staff member")
                .then(m => del(m, 7500));
        }

        const toKick = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

        // No member found
        if (!toKick) {
            return message.reply("Couldn't find that member, try again")
                .then(m => del(m, 7500));
        }

        // Can't kick urself
        if (toKick.id === message.author.id) {
            return message.reply("You can't kick yourself...")
                .then(m => del(m, 7500));
        }

        // Check if the user's kickable
        if (!toKick.kickable) {
            return message.reply("I can't kick that person due to role hierarchy, I suppose.")
                .then(m => del(m, 7500));
        }

        const embed = new MessageEmbed()
            .setColor("#ff0000")
            .setThumbnail(toKick.user.displayAvatarURL())
            .setFooter(message.member.displayName, message.author.displayAvatarURL())
            .setTimestamp()
            .setDescription(stripIndents`**> Kicked member:** ${toKick} (${toKick.id})
            **> Kicked by:** ${message.member} (${message.member.id})
            **> Reason:** ${args.slice(1).join(" ")}`);

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

                toKick.kick(args.slice(1).join(" "))
                    .catch(err => {
                        if (err) return message.channel.send(`Well.... the kick didn't work out. Here's the error ${err}`)
                    });

                logChannel.send(embed);
            } else if (emoji === "❌") {
                del(msg, 0);

                message.reply(`Kick canceled.`)
                    .then(m => del(m, 7500));
            }
        });
    }
};