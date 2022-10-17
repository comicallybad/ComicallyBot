const { s, r, del, messagePrompt } = require("../../functions.js");
const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");

module.exports = {
    name: "unmute",
    category: "moderation",
    description: "Remove timeout from a member.",
    permissions: "moderator",
    usage: "<@user | userID>",
    run: async (client, message, args) => {
        if (!message.guild.me.permissions.has("MANAGE_ROLES"))
            return r(message.channel, message.author, "I don't have permission to manage roles!").then(m => del(m, 7500));

        const logChannel = message.guild.channels.cache.find(c => c.name.includes("mod-logs")) || message.channel;
        let mutee = message.mentions.members.first() || await message.guild.members.fetch(args[0]);
        if (!mutee) return r(message.channel, message.author, "Please supply a member to be timed out!").then(m => del(m, 7500));

        if (mutee.id === message.author.id)
            return r(message.channel, message.author, "You can't timeout yourself...? This should not even be possible if you are timed out...").then(m => del(m, 7500));

        let reason = args.slice(1).join(" ");
        if (!reason) reason = "No reason given"

        const promptEmbed = new MessageEmbed()
            .setColor("GREEN")
            .setAuthor({ name: `This verification becomes invalid after 30s.` })
            .setDescription(`Do you want to remove ${mutee}'s timeout?`)

        return s(message.channel, '', promptEmbed).then(async msg => {
            const emoji = await messagePrompt(msg, message.author, 30, ["✅", "❌"]);

            if (emoji === "✅") {
                del(msg, 0);

                const embed = new MessageEmbed()
                    .setColor("#00ff00")
                    .setTitle("Member Timeout Removed")
                    .setThumbnail(mutee.user.displayAvatarURL())
                    .setFooter({ text: message.member.displayName, iconURL: message.author.displayAvatarURL() })
                    .setTimestamp()
                    .setDescription(stripIndents`
                    **Member's Timeout Removed:** ${mutee} (${mutee.id})
                    **Timeout Removed By:** ${message.member}
                    **Reason:** ${reason}`);

                mutee.timeout(null, `${reason}`).then(() => {
                    mutee.send(`Hello, your **timeout** has been removed in ${message.guild.name} for: **${reason}**`).catch(err => err); //in case DM's are closed
                    r(message.channel, message.author, `${mutee.user.username} was successfully removed from timeout.`).then(m => del(m, 7500));
                    return s(logChannel, '', embed);
                }).catch(err => r(message.channel, message.author, `There was an error attempting to untimeout ${mutee}: ${err}`).then(m => del(m, 7500)));
            } else if (emoji === "❌") {
                del(msg, 0);
                return r(message.channel, message.author, `Timeout cancelled.`).then(m => del(m, 7500));
            } else return del(msg, 0)
        }).catch(err => err);
    }
}