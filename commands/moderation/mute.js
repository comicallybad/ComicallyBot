const { s, r, del, promptMessage, checkMuteRole } = require("../../functions.js");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "mute",
    aliases: ["timeout"],
    category: "moderation",
    description: "Mute a member.",
    permissions: "moderator",
    usage: "<@user | userID> [reason]",
    run: async (client, message, args) => {
        const logChannel = message.guild.channels.cache.find(c => c.name.includes("mod-logs")) || message.channel;

        if (!message.guild.me.permissions.has("MANAGE_ROLES") || !message.guild.me.permissions.has("MANAGE_CHANNELS"))
            return r(message.channel, message.author, "I don't have permission to manage roles or channels!").then(m => del(m, 7500));

        let mutee = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!mutee) return r(message.channel, message.author, "Please provide a user to be muted!").then(m => del(m, 7500));

        if (mutee.id === message.author.id)
            return r(message.channel, message.author, "You can't mute yourself...").then(m => del(m, 7500));

        let reason = args.slice(1).join(" ");
        if (!reason) reason = "No reason given"

        const promptEmbed = new MessageEmbed()
            .setColor("GREEN")
            .setAuthor({ name: `This verification becomes invalid after 30s.` })
            .setDescription(`Do you want to mute ${mutee}?`)

        const promptEmbedTimer = new MessageEmbed()
            .setColor("#0efefe")
            .setAuthor({ name: `This verification becomes invalid after 30s.` })
            .setDescription(`How long do you wish to mute ${mutee}? (in minutes)`)

        await s(message.channel, '', promptEmbed).then(async msg => {
            const emoji = await promptMessage(msg, message.author, 30, ["✅", "❌"]);

            if (emoji === "✅") {
                del(msg, 0);

                await s(message.channel, '', promptEmbedTimer).then(async msg => {
                    const emojiTime = await promptMessage(msg, message.author, 30, ["1️⃣", "5️⃣", "🔟"]);

                    if (emojiTime === "1️⃣") {
                        del(msg, 0);
                        mutee.timeout(60000, `${reason}`).then(() => {
                            mutee.send(`Hello, you have been **muted** for **1 minute** in ${message.guild.name} for: **${reason}**`).catch(err => err); //in case DM's are closed
                            r(message.channel, message.author, `${mutee.user.username} was successfully muted for **1 minute**.`).then(m => del(m, 7500));
                            embed.addField("Mute Time: ", "1 Minute");

                            return s(logChannel, '', embed);
                        }).catch(err => r(`There was an error timing out that user: ${err}`));
                    } else if (emojiTime === "5️⃣") {
                        del(msg, 0);
                        mutee.timeout(300000, `${reason}`).then(() => {
                            mutee.send(`Hello, you have been **muted** for **5 minutes** in ${message.guild.name} for: **${reason}**`).catch(err => err); //in case DM's are closed
                            r(message.channel, message.author, `${mutee.user.username} was successfully muted for **5 minutes**.`).then(m => del(m, 7500));
                            embed.addField("Mute Time: ", "5 Minutes");

                            return s(logChannel, '', embed);
                        }).catch(err => r(`There was an error timing out that user: ${err}`));
                    } else if (emojiTime === "🔟") {
                        del(msg, 0);
                        mutee.timeout(600000, `${reason}`).then(() => {
                            mutee.send(`Hello, you have been **muted** for **10 minutes** in ${message.guild.name} for: **${reason}**`).catch(err => err); //in case DM's are closed
                            r(message.channel, message.author, `${mutee.user.username} was successfully muted for **10 minutes**.`).then(m => del(m, 7500));
                            embed.addField("Mute Time: ", "10 Minutes");

                            return s(logChannel, '', embed);
                        }).catch(err => r(`There was an error timing out that user: ${err}`));
                    } else return del(msg, 0);
                }).catch(err => console.log(`There was an error muting ${err}`));
            } else if (emoji === "❌") {
                del(msg, 0);
                return r(message.channel, message.author, `Mute cancelled.`).then(m => del(m, 7500));
            } else return del(msg, 0);
        }).catch(err => err);
    }
}