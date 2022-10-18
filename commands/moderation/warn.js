const { s, r, del } = require("../../functions");
const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");

module.exports = {
    name: "warn",
    category: "moderation",
    description: "Warns a member with an embed on their actions they made.",
    permissions: "moderator",
    usage: "<@user | userID> [#channel] <message>",
    run: async (client, message, args) => {
        const logChannel = message.guild.channels.cache.find(c => c.name.includes("mod-logs")) || message.channel;

        let embed = new MessageEmbed()
            .setTitle("Warning!")
            .setColor("#FF0000")
            .setTimestamp();

        let logEmbed = new MessageEmbed()
            .setTitle("Member warned")
            .setColor("#FF0000")
            .setTimestamp();

        if (!args[0])
            return r(message.channel, message.author, "Please provide a channel and something to say, or just something to say.").then(m => del(m, 7500));

        if (message.mentions.channels.first()) {
            let channelMentionID = args[1].replace("<#", "").slice(args[1].replace("<#", "").indexOf(":") + 1, args[1].replace("<#", "").length - 1);
            if (message.mentions.channels.first().id === channelMentionID) {
                if (!args[2])
                    return r(message.channel, "Please provide a reason for the warning").then(m => del(m, 7500));

                let member = message.mentions.members.first() || await message.guild.members.fetch(args[0]);
                if (!member) return r(message.channel, message.author, "Please provide a member to be to be warned!").then(m => del(m, 7500));
                let channel = await message.guild.channels.fetch(message.mentions.channels.first().id);

                embed.setDescription(`${args.slice(2).join(' ')}`)
                    .addFields({ name: "You have been warned: ", value: `${member}` })
                    .setFooter({ text: member.displayName, iconURL: member.user.displayAvatarURL() });

                logEmbed.setDescription(stripIndents`
                        **Member warned:** ${member} (${member.id})
                        **Warned By:** ${message.author} (${message.author.id})
                        **Warned in channel:** ${channel} (${channel.id})
                        **Warned for:** ${args.slice(2).join(' ')}`)
                    .setFooter({ text: message.member.displayName, iconURL: message.author.displayAvatarURL() });

                s(logChannel, "", logEmbed);
                return s(channel, "", embed).catch(err => r(message.channel, message.author, `There was an error sending a message to that channel. ${err}`).then(m => del(m, 7500)));
            }
        } else {
            if (!args[1])
                return r(message.channel, message.author, "Please provide a reason for the warning").then(m => del(m, 7500));

            let member = message.mentions.members.first() || await message.guild.members.fetch(args[0]);
            if (!member) return r(message.channel, message.author, "Please provide a member to be to be warned!").then(m => del(m, 7500));

            embed.setDescription(`${args.slice(1).join(' ')}`)
                .addFields({ name: "You have been warned: ", value: `${member}` })
                .setFooter({ text: member.displayName, iconURL: member.user.displayAvatarURL() });

            logEmbed.setDescription(stripIndents`
                    **Member warned:** ${member} (${member.id})
                    **Warned By:** ${message.author} (${message.author.id})
                    **Warned for:** ${args.slice(1).join(' ')}`)
                .setFooter({ text: message.member.displayName, iconURL: message.author.displayAvatarURL() });

            s(logChannel, "", logEmbed);
            return s(message.channel, "", embed).catch(err => r(message.channel, message.author, `There was an error sending a message to that channel. ${err}`).then(m => del(m, 7500)));
        }
    }
}
