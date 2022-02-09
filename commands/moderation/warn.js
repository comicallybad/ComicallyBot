const { s, r, del } = require("../../functions");
const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");

module.exports = {
    name: "warn",
    aliases: ["warnuser", "userwarn", "warning"],
    category: "moderation",
    description: "Warns a user with an embed on their actions they made.",
    permissions: "moderator",
    usage: "<@user | userID> [#channel] <message>",
    run: async (client, message, args) => {
        const logChannel = message.guild.channels.cache.find(c => c.name.includes("mod-logs")) || message.channel;

        let embed = new MessageEmbed()
            .setTitle("Warning!")
            .setColor("#FF0000")
            .setTimestamp();

        let logEmbed = new MessageEmbed()
            .setTitle("User warned")
            .setColor("#FF0000")
            .setTimestamp();

        if (!args[0]) {
            return r(message.channel, message.author, "Please provide a channel and something to say, or just something to say.").then(m => del(m, 7500));
        } else if (message.mentions.channels.first()) {
            let channelMentionID = args[1].replace("<#", "").slice(args[1].replace("<#", "").indexOf(":") + 1, args[1].replace("<#", "").length - 1);
            if (message.mentions.channels.first().id === channelMentionID) {
                if (!args[2])
                    return r(message.channel, "Please provide a reason for the warning").then(m => del(m, 7500));

                console.log("inside first if")

                let user = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
                if (!user) return r(message.channel, message.author, "Please provide a user to be to be warned!").then(m => del(m, 7500));
                let channel = await message.guild.channels.cache.get(message.mentions.channels.first().id);

                embed
                    .addField("You have been warned: ", `${user}`)
                    .setDescription(`${args.slice(2).join(' ')}`)
                    .setFooter({ text: user.displayName, iconURL: user.user.displayAvatarURL() });

                logEmbed.setDescription(stripIndents`
                        **User warned:** ${user} (${user.id})
                        **User warned By:** ${message.author} (${message.author.id})
                        **User warned in channel:** ${channel} (${channel.id})
                        **User warned for:** ${args.slice(2).join(' ')}`)
                    .setFooter({ text: message.member.displayName, iconURL: message.author.displayAvatarURL() });

                s(logChannel, "", logEmbed);
                return s(channel, "", embed).catch(err => r(message.channel, message.author, `There was an error sending a message to that channel. ${err}`).then(m => del(m, 7500)));
            }
        } else {
            if (!args[1])
                return r(message.channel, message.author, "Please provide a reason for the warning").then(m => del(m, 7500));

            let user = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
            if (!user) return r(message.channel, message.author, "Please provide a user to be to be warned!").then(m => del(m, 7500));

            embed
                .addField("You have been warned: ", `${user}`)
                .setDescription(`${args.slice(1).join(' ')}`)
                .setFooter({ text: user.displayName, iconURL: user.user.displayAvatarURL() });

            logEmbed.setDescription(stripIndents`
                    **User warned:** ${user} (${user.id})
                    **User warned By:** ${message.author} (${message.author.id})
                    **User warned for:** ${args.slice(1).join(' ')}`)
                .setFooter({ text: message.member.displayName, iconURL: message.author.displayAvatarURL() });

            s(logChannel, "", logEmbed);
            return s(message.channel, "", embed).catch(err => r(message.channel, message.author, `There was an error sending a message to that channel. ${err}`).then(m => del(m, 7500)));
        }
    }
}
