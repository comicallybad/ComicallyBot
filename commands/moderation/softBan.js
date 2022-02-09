const { s, r, del, promptMessage } = require("../../functions.js");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "softban",
    aliases: ["sban", "tempban"],
    category: "moderation",
    description: "Soft ban a member.",
    permissions: "moderator",
    usage: "<@user | userID> [reason]",
    run: async (client, message, args) => {
        const logChannel = message.guild.channels.cache.find(c => c.name.includes("mod-logs")) || message.channel;

        if (!message.guild.me.permissions.has("BAN_MEMBERS"))
            return r(message.channel, message.author, "I don't have the permission to perform this command!").then(m => del(m, 7500));

        if (!args[0])
            return r(message.channel, message.author, "Please provide a user to softban.").then(m => del(m, 7500));

        try {
            let toBan = message.mentions.members.first() || await message.guild.members.cache.get(args[0]);
            if (!toBan) toBan = await client.users.fetch(args[0]);
            if (!toBan) return r(message.channel, message.author, "Could not find that user!").then(m => del(m, 7500));

            if (toBan.id === message.author.id)
                return r(message.channel, message.author, "You can't softban yourself...").then(m => del(m, 7500));

            let reason = args.slice(1).join(" ")
            if (!reason) reason = "No reason given!"

            const embed = new MessageEmbed()
                .setColor("#ff0000")
                .setTitle("SoftBan Command Used")
                .setThumbnail(toBan.displayAvatarURL())
                .setFooter({ text: message.member.displayName, iconURL: message.author.displayAvatarURL() })
                .setTimestamp()
                .setDescription(`**SoftBan command used By:** ${message.author}`);

            const promptEmbed = new MessageEmbed()
                .setColor("GREEN")
                .setAuthor({ name: `This verification becomes invalid after 30s.` })
                .setDescription(`Do you want to softban ${toBan}?`)

            await s(message.channel, '', promptEmbed).then(async msg => {
                const emoji = await promptMessage(msg, message.author, 30, ["✅", "❌"]);

                if (emoji === "✅") {
                    del(msg, 0);

                    message.guild.members.ban(toBan.id, { reason: `${reason}`, days: 7 }).then(() => {
                        message.guild.members.unban(toBan.id)
                        toBan.send(`Hello, you have been **soft banned** in ${message.guild.name} for: **${reason}**`).catch(err => err) //in case DM's are closed
                        r(message.channel, message.author, `${toBan.username}(${toBan.id}) was successfully soft banned.`).then(m => del(m, 7500));
                        return s(logChannel, '', embed);
                    }).catch(err => {
                        if (err) return r(message.channel, message.author, `There was an error attempting to softban ${toBan} ${err}`).then(m => del(m, 7500));
                    });
                } else if (emoji === "❌") {
                    del(msg, 0);
                    return r(message.channel, message.author, `Softban cancelled.`).then(m => del(m, 7500));
                } else return del(msg, 0)
            }).catch(err => err);
        } catch (err) {
            if (err) return r(message.channel, message.author, `There was an error attempting to softban that user: ${err}`).then(m => del(m, 7500));
        }
    }
}