const { s, r, del, promptMessage } = require("../../functions.js");
const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");

module.exports = {
    name: "ban",
    category: "moderation",
    description: "Ban a member.",
    permissions: "moderator",
    usage: "<@user | userID> [reason]",
    run: async (client, message, args) => {
        const logChannel = message.guild.channels.cache.find(c => c.name.includes("mod-logs")) || message.channel;

        if (!message.guild.me.permissions.has("BAN_MEMBERS"))
            return r(message.channel, message.author, "I don't have permission to ban members!").then(m => del(m, 7500));

        try {
            if (!args[0])
                return r(message.channel, message.author, "Please provide a user to be banned!").then(m => del(m, 7500));

            let toBan = message.mentions.members.first() || await message.guild.members.cache.get(args[0]);
            if (!toBan) toBan = await client.users.fetch(args[0]);
            if (!toBan) return r(message.channel, message.author, "Could not find that user!").then(m => del(m, 7500));

            if (toBan.id === message.author.id)
                return r(message.channel, message.author, "You can't ban yourself...").then(m => del(m, 7500));

            let reason = args.slice(1).join(" ")
            if (!reason) reason = "No reason given!"

            const embed = new MessageEmbed()
                .setColor("#ff0000")
                .setTitle("Ban Command Used")
                .setThumbnail(toBan.user ? toBan.user.displayAvatarURL() : toBan.displayAvatarURL())
                .setFooter(message.member.displayName, message.author.displayAvatarURL())
                .setTimestamp()
                .setDescription(`**Ban command used by:** ${message.author}`);

            const promptEmbed = new MessageEmbed()
                .setColor("GREEN")
                .setAuthor(`This verification becomes invalid after 30s.`)
                .setDescription(`Do you want to ban ${toBan}?`)

            await s(message.channel, '', promptEmbed).then(async msg => {
                const emoji = await promptMessage(msg, message.author, 30, ["✅", "❌"]);

                if (emoji === "✅") {
                    del(msg, 0);

                    message.guild.members.ban(toBan.id, { reason: `${reason}`, days: 7 }).then(() => {
                        toBan.send(`Hello, you have been **banned** in ${message.guild.name} for: **${reason}**`).catch(err => err); //in case DM's are closed
                        r(message.channel, message.author, `${toBan.username} (${toBan.id}) was successfully banned.`).then(m => del(m, 7500));
                        return s(logChannel, '', embed);
                    }).catch(err => {
                        if (err) return r(message.channel, message.author, `There was an error attempting to ban ${toBan} ${err}`).then(m => del(m, 7500));
                    });
                } else if (emoji === "❌") {
                    del(msg, 0);
                    return r(message.channel, message.author, `Ban cancelled.`).then(m => del(m, 7500));
                } else return del(msg, 0);
            }).catch(err => err);
        } catch (err) {
            if (err) return r(message.channel, message.author, `There was an error attempting to ban that user: ${err}`).then(m => del(m, 7500));
        }
    }
}