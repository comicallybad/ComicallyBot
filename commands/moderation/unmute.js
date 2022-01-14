const { s, r, del, promptMessage } = require("../../functions.js");
const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");

module.exports = {
    name: "unmute",
    category: "moderation",
    description: "Unmute a member.",
    permissions: "moderator",
    usage: "<@user | userID>",
    run: async (client, message, args) => {
        const logChannel = message.guild.channels.cache.find(c => c.name.includes("mod-logs")) || message.channel;

        if (!message.guild.me.permissions.has("MANAGE_ROLES"))
            return r(message.channel, message.author, "I don't have permission to manage roles!").then(m => del(m, 7500));

        let mutee = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!mutee) return r(message.channel, message.author, "Please supply a user to be muted!").then(m => del(m, 7500));

        if (mutee.id === message.author.id)
            return r(message.channel, message.author, "You can't unmute yourself...? This should not even be possible if you are muted...").then(m => del(m, 7500));

        let reason = args.slice(1).join(" ");
        if (!reason) reason = "No reason given"

        try {
            let muterole = message.guild.roles.cache.find(r => r.name === "Muted")
            if (!muterole) return r(message.channel, message.author, "There is no mute role to remove!").then(m => del(m, 7500));

            const embed = new MessageEmbed()
                .setColor("#00ff00")
                .setTitle("Member Unmuted")
                .setThumbnail(mutee.user.displayAvatarURL())
                .setFooter(message.member.displayName, message.author.displayAvatarURL())
                .setTimestamp()
                .setDescription(stripIndents`
                **Unmuted member:** ${mutee} (${mutee.id})
                **Unmuted by:** ${message.member}
                **Reason:** ${reason}`);

            const promptEmbed = new MessageEmbed()
                .setColor("GREEN")
                .setAuthor(`This verification becomes invalid after 30s.`)
                .setDescription(`Do you want to unmute ${mutee}?`)

            await s(message.channel, '', promptEmbed).then(async msg => {
                const emoji = await promptMessage(msg, message.author, 30, ["✅", "❌"]);

                if (emoji === "✅") {
                    del(msg, 0);

                    mutee.roles.remove(muterole.id).then(() => {
                        mutee.send(`Hello, you have been **unmuted** in ${message.guild.name} for: **${reason}**`).catch(err => err); //in case DM's are closed
                        r(message.channel, message.author, `${mutee.user.username} was successfully unmuted.`).then(m => del(m, 7500));
                        return s(logChannel, '', embed);
                    }).catch(err => {
                        if (err) return r(message.channel, message.author, `There was an error attempting to unmute ${mutee} ${err}`).then(m => del(m, 7500));
                    });
                } else if (emoji === "❌") {
                    del(msg, 0);
                    return r(message.channel, message.author, `Unmute cancelled.`).then(m => del(m, 7500));
                } else return del(msg, 0)
            }).catch(err => err);
        } catch (err) {
            if (err) return r(message.channel, message.author, `There was an error attempting to unmute that user: ${err}`).then(m => del(m, 7500));
        }
    }
}