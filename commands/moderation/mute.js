const { del, promptMessage, checkMuteRole } = require("../../functions.js");
const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");

module.exports = {
    name: "mute",
    category: "moderation",
    description: "Mute a member.",
    permissions: "moderator",
    usage: "<@user | userID> [reason]",
    run: async (client, message, args) => {
        const logChannel = message.guild.channels.cache.find(c => c.name.includes("mod-logs")) || message.channel;

        if (!message.guild.me.permissions.has("MANAGE_ROLES") || !message.guild.me.permissions.has("MANAGE_CHANNELS"))
            return message.reply("I don't have permission to manage roles or channels!").then(m => del(m, 7500));

        let mutee = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!mutee) return message.reply("Please provide a user to be muted!").then(m => del(m, 7500));

        if (mutee.id === message.author.id)
            return message.reply("You can't mute yourself...").then(m => del(m, 7500));

        let reason = args.slice(1).join(" ");
        if (!reason) reason = "No reason given"

        //define mute role and if the mute role doesnt exist then create one
        let muterole = await checkMuteRole(message);

        const embed = new MessageEmbed()
            .setColor("#ff0000")
            .setTitle("User Muted")
            .setThumbnail(mutee.user.displayAvatarURL())
            .setFooter(message.member.displayName, message.author.displayAvatarURL())
            .setTimestamp()
            .setDescription(stripIndents`
            **Muted member:** ${mutee} (${mutee.id})
            **Muted by:** ${message.member}
            **Reason:** ${reason}`);

        const promptEmbed = new MessageEmbed()
            .setColor("GREEN")
            .setAuthor(`This verification becomes invalid after 30s.`)
            .setDescription(`Do you want to mute ${mutee}?`)

        const promptEmbedTimer = new MessageEmbed()
            .setColor("#0efefe")
            .setAuthor(`This verification becomes invalid after 30s.`)
            .setDescription(`How long do you wish to mute ${mutee}? (in minutes)`)

        await message.channel.send(promptEmbed).then(async msg => {
            const emoji = await promptMessage(msg, message.author, 30, ["✅", "❌"]);

            if (emoji === "✅") {
                del(msg, 0);

                await message.channel.send(promptEmbedTimer).then(async msg => {
                    const emojiTime = await promptMessage(msg, message.author, 30, ["1️⃣", "5️⃣", "🔟", "♾️"]);

                    if (emojiTime === "1️⃣") {
                        del(msg, 0);
                        mutee.roles.add(muterole.id).then(() => {
                            mutee.send(`Hello, you have been **muted** for **1 minute** in ${message.guild.name} for: **${reason}**`).catch(err => err); //in case DM's are closed
                            message.reply(`${mutee.user.username} was successfully muted for **1 minute**.`).then(m => del(m, 7500));
                            embed.addField("Mute Time: ", "1 Minute");
                            logChannel.send(embed).catch(err => err);
                        }).catch(err => {
                            if (err) return message.reply(`There was an error attempting to mute ${mutee} ${err}`).then(m => del(m, 7500));
                        }).then(setTimeout(() => {
                            mutee.roles.remove(muterole.id).then(() => {
                                mutee.send(`Hello, you have now been **unmuted** in ${message.guild.name} `).catch(err => err); //in case DM's are closed
                                message.reply(`${mutee.user.username} was successfully unmuted.`).then(m => del(m, 7500));
                            }).catch(err => {
                                if (err) return message.reply(`There was an error attempting to unmute ${mutee} ${err}`).then(m => del(m, 7500));
                            });
                        }, 60000));
                    } else if (emojiTime === "5️⃣") {
                        del(msg, 0);
                        mutee.roles.add(muterole.id).then(() => {
                            mutee.send(`Hello, you have been **muted** for **5 minutes** in ${message.guild.name} for: **${reason}**`).catch(err => err); //in case DM's are closed
                            message.reply(`${mutee.user.username} was successfully muted for **5 minutes**.`).then(m => del(m, 7500));
                            embed.addField("Mute Time: ", "5 Minutes");
                            logChannel.send(embed).catch(err => err);
                        }).catch(err => {
                            if (err) return message.reply(`There was an error attempting to mute ${mutee} ${err}`).then(m => del(m, 7500));
                        }).then(setTimeout(() => {
                            mutee.roles.remove(muterole.id).then(() => {
                                mutee.send(`Hello, you have now been **unmuted** in ${message.guild.name} `).catch(err => err); //in case DM's are closed
                                message.reply(`${mutee.user.username} was successfully unmuted.`).then(m => del(m, 7500));
                            }).catch(err => {
                                if (err) return message.reply(`There was an error attempting to unmute ${mutee} ${err}`).then(m => del(m, 7500));
                            });
                        }, 300000));
                    } else if (emojiTime === "🔟") {
                        del(msg, 0);
                        mutee.roles.add(muterole.id).then(() => {
                            mutee.send(`Hello, you have been **muted** for **10 minutes** in ${message.guild.name} for: **${reason}**`).catch(err => err); //in case DM's are closed
                            message.reply(`${mutee.user.username} was successfully muted for **10 minutes**.`).then(m => del(m, 7500));
                            embed.addField("Mute Time: ", "10 Minutes");
                            logChannel.send(embed).catch(err => err);
                        }).catch(err => {
                            if (err) return message.reply(`There was an error attempting to mute ${mutee} ${err}`).then(m => del(m, 7500));
                        }).then(setTimeout(() => {
                            mutee.roles.remove(muterole.id).then(() => {
                                mutee.send(`Hello, you have now been **unmuted** in ${message.guild.name} `).catch(err => err); //in case DM's are closed
                                message.reply(`${mutee.user.username} was successfully unmuted.`).then(m => del(m, 7500));
                            }).catch(err => {
                                if (err) return message.reply(`There was an error attempting to unmute ${mutee} ${err}`).then(m => del(m, 7500));
                            });
                        }, 600000));
                    } else if (emojiTime === "♾️") {
                        del(msg, 0);
                        mutee.roles.add(muterole.id).then(() => {
                            mutee.send(`Hello, you have been **muted** **indefinitely** in ${message.guild.name} for: **${reason}**`).catch(err => err); //in case DM's are closed
                            message.reply(`${mutee.user.username} was successfully muted **indefinitely**.`).then(m => del(m, 7500));
                            embed.addField("Mute Time: ", "Indefinite");
                            logChannel.send(embed).catch(err => err);
                        }).catch(err => {
                            if (err) return message.reply(`There was an error attempting to mute ${mutee} ${err}`).then(m => del(m, 7500));
                        });
                    } else {
                        return del(msg, 0);
                    }
                }).catch(err => console.log(`There was an error in mute1 ${err}`));
            } else if (emoji === "❌") {
                del(msg, 0);
                return message.reply(`Mute cancelled.`).then(m => del(m, 7500));
            } else {
                return del(msg, 0);
            }
        }).catch(err => console.log(`There was an error in mute ${err}`));
    }
}