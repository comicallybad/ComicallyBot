const { del, promptMessage } = require("../../functions.js");
const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");

module.exports = {
    name: "unban",
    category: "moderation",
    description: "Unban a member.",
    permissions: "moderator",
    usage: "<userID> [reason]",
    run: async (client, message, args) => {
        const logChannel = message.guild.channels.cache.find(c => c.name === "mod-logs") || message.channel;

        if (!message.member.hasPermission("BAN_MEMBERS"))
            return message.reply("You don't have the ban members permission to perform this command!").then(m => del(m, 7500));

        if (!message.guild.me.hasPermission("BAN_MEMBERS"))
            return message.reply("I don't have the permission to perform this command!").then(m => del(m, 7500));

        if (isNaN(args[0]))
            return message.reply("You need to provide an ID.").then(m => del(m, 7500));

        let bannedMember = await client.users.fetch(args[0])
            .catch(err => message.channel.send(`There was a problem fetching that user. ${err}`).then(m => del(m, 7500)));

        if (!bannedMember) return message.channel.send("Please provide a user id to unban someone!").then(m => del(m, 7500));

        let reason = args.slice(1).join(" ")
        if (!reason) reason = "No reason given!"

        const embed = new MessageEmbed()
            .setColor("#ff0000")
            .setTitle("User Unbanned")
            .setFooter(message.member.displayName, message.author.displayAvatarURL())
            .setTimestamp()
            .setDescription(stripIndents`
            **Unbanned member:** ${bannedMember} (${bannedMember.id})
            **Unbanned by:** ${message.member}
            **Reason:** ${reason}`);

        const promptEmbed = new MessageEmbed()
            .setColor("GREEN")
            .setAuthor(`This verification becomes invalid after 30s.`)
            .setDescription(`Do you want to unban ${bannedMember}?`)

        // Send the message
        await message.channel.send(promptEmbed).then(async msg => {
            // Await the reactions and the reactioncollector
            const emoji = await promptMessage(msg, message.author, 30, ["✅", "❌"]);

            // Verification stuffs
            if (emoji === "✅") {
                del(msg, 0);

                //attempt unban and send message
                message.guild.members.unban(bannedMember).then(() => {
                    bannedMember.send(`Hello, you have been **unbanned** in ${message.guild.name} for: **${reason}**`).catch(err => err); //in case DM's are closed
                    message.reply(`${bannedMember.username} (${bannedMember.id}) was successfully unbanned.`).then(m => del(m, 7500));
                }).catch(err => {
                    if (err) return message.reply(`There was an error attempting to unban ${bannedMember} ${err}`).then(m => del(m, 7500));
                });

                logChannel.send(embed);
            } else if (emoji === "❌") {
                del(msg, 0);
                return message.reply(`Unban cancelled.`).then(m => del(m, 7500));
            } else {
                return del(msg, 0)
            }
        }).catch(err => console.log(`There was an error in unban ${err}`));
    }
}
