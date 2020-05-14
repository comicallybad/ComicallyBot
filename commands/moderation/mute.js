const { del, promptMessage } = require("../../functions.js");
const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");

module.exports = {
    name: "mute",
    category: "moderation",
    description: "Mute a member.",
    permissions: "moderator",
    usage: "<id | mention> [reason]",
    run: async (client, message, args) => {
        const logChannel = message.guild.channels.cache.find(c => c.name === "mod-logs") || message.channel;

        if (!message.guild.me.hasPermission("MANAGE_ROLES"))
            return message.reply("I don't have permission to manage roles!").then(m => del(m, 7500));

        let mutee = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!mutee) return message.reply("Please provide a user to be muted!").then(m => del(m, 7500));

        if (mutee.id === message.author.id)
            return message.reply("You can't mute yourself...").then(m => del(m, 7500));

        let reason = args.slice(1).join(" ");
        if (!reason) reason = "No reason given"

        //define mute role and if the mute role doesnt exist then create one
        let muterole = message.guild.roles.cache.find(r => r.name === "Muted")
        if (!muterole) {
            try {
                muterole = await message.guild.roles.create({
                    data: {
                        name: "Muted",
                        color: "#778899",
                        permissions: []
                    }
                })
                message.guild.channels.cache.forEach(async (channel, id) => {
                    await channel.updateOverwrite(muterole, {
                        SEND_MESSAGES: false,
                        ADD_REACTIONS: false,
                        SEND_TTS_MESSAGES: false,
                        ATTACH_FILES: false,
                        SPEAK: false,
                        CONNECT: false
                    })
                })
            } catch (e) {
                console.log(e.stack);
            }
        }

        const embed = new MessageEmbed()
            .setColor("#ff0000")
            .setTitle("User Muted")
            .setThumbnail(mutee.user.displayAvatarURL())
            .setFooter(message.member.displayName, message.author.displayAvatarURL())
            .setTimestamp()
            .setDescription(stripIndents`
            **Muted member: ${mutee} (${mutee.id})**
            **Muted by: ${message.member}**
            **Reason: ${reason}**`);

        const promptEmbed = new MessageEmbed()
            .setColor("GREEN")
            .setAuthor(`This verification becomes invalid after 30s.`)
            .setDescription(`Do you want to mute ${mutee}?`)

        // Send the message
        await message.channel.send(promptEmbed).then(async msg => {
            // Await the reactions and the reactioncollector
            const emoji = await promptMessage(msg, message.author, 30, ["✅", "❌"]);

            // Verification stuffs
            if (emoji === "✅") {
                del(msg, 0);

                //add role to the mentioned user and also send the user a dm explaing where and why they were muted
                mutee.roles.add(muterole.id).then(() => {
                    mutee.send(`Hello, you have been **muted** in ${message.guild.name} for: **${reason}**`).catch(err => err); //in case DM's are closed
                    message.reply(`${mutee.user.username} was successfully muted.`).then(m => del(m, 7500));
                }).catch(err => {
                    if (err) return message.reply(`There was an error attempting to mute ${mutee} ${err}`).then(m => del(m, 7500));
                });

                logChannel.send(embed);
            } else if (emoji === "❌") {
                del(msg, 0);
                message.reply(`Mute cancelled.`).then(m => del(m, 7500));
            }
        });
    }
}