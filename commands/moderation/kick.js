const { s, r, del, promptMessage } = require("../../functions.js");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "kick",
    category: "moderation",
    description: "Kick a member.",
    permissions: "moderator",
    usage: "<@user | userID>",
    run: async (client, message, args) => {
        const logChannel = message.guild.channels.cache.find(c => c.name.includes("mod-logs")) || message.channel;

        if (!message.guild.me.permissions.has("KICK_MEMBERS"))
            return r(message.channel, message.author, "I don't have permission to kick members!").then(m => del(m, 7500));

        if (!args[0])
            return r(message.channel, message.author, "Please provide a user to be kicked!").then(m, del(m, 7500));

        let toKick = message.mentions.members.first() || await message.guild.members.cache.get(args[0]);
        if (!toKick) toKick = await client.users.fetch(args[0]);
        if (!toKick) return r(message.channel, message.author, "Could not find that user!").then(m => del(m, 7500));

        if (toKick.id === message.author.id)
            return r(message.channel, message.author, "You can't kick yourself...").then(m => del(m, 7500));

        try {
            let reason = args.slice(1).join(" ");
            if (!reason) reason = "No reason given!";
            const embed = new MessageEmbed()
                .setColor("#ff0000")
                .setTitle("Kick Command Used")
                .setThumbnail(toKick.user ? toKick.user.displayAvatarURL() : toKick.displayAvatarURL())
                .setFooter({ text: message.member.displayName, iconURL: message.author.displayAvatarURL() })
                .setTimestamp()
                .setDescription(`**Kick command used By:** ${message.author}`);

            const promptEmbed = new MessageEmbed()
                .setColor("GREEN")
                .setAuthor({ name: `This verification becomes invalid after 30s.` })
                .setDescription(`Do you want to kick ${toKick}?`)

            await s(message.channel, '', promptEmbed).then(async msg => {
                const emoji = await promptMessage(msg, message.author, 30, ["✅", "❌"]);

                if (emoji === "✅") {
                    del(msg, 0);

                    message.guild.members.kick(toKick, reason).then(() => {
                        toKick.send(`Hello, you have been **kicked** in ${message.guild.name} for: **${reason}**`).catch(err => err); //in case DM's are closed
                        r(message.channel, message.author, `${toKick.username}(${toKick.id}) was successfully kicked.`).then(m => del(m, 7500));
                        return s(logChannel, '', embed);
                    }).catch(err => {
                        if (err) return r(message.channel, message.author, `There was an error attempting to kick ${toKick} ${err}`).then(m => del(m, 7500));
                    });
                } else if (emoji === "❌") {
                    del(msg, 0);
                    return r(message.channel, message.author, `Kick cancelled.`).then(m => del(m, 7500));
                } else return del(msg, 0);
            }).catch(err => err);
        } catch (err) {
            if (err) return r(message.channel, message.author, `There was an error attempting to kick that user: ${err}`).then(m => del(m, 7500));
        }
    }
}