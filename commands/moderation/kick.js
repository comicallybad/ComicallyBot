const { s, del, promptMessage } = require("../../functions.js");
const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");

module.exports = {
    name: "kick",
    category: "moderation",
    description: "Kick a member.",
    permissions: "moderator",
    usage: "<@user | userID>",
    run: async (client, message, args) => {
        const logChannel = message.guild.channels.cache.find(c => c.name.includes("mod-logs")) || message.channel;

        if (!message.guild.me.permissions.has("KICK_MEMBERS"))
            return message.reply("I don't have permission to kick members!").then(m => del(m, 7500));

        if (!args[0])
            return message.reply("Please provide a user to be kicked!").then(m, del(m, 7500));

        let toKick = message.mentions.members.first() || await message.guild.members.cache.get(args[0]);
        if (!toKick) toKick = await client.users.fetch(args[0]);
        if (!toKick) return message.reply("Could not find that user!").then(m => del(m, 7500));

        if (toKick.id === message.author.id)
            return message.reply("You can't kick yourself...").then(m => del(m, 7500));

        if (!toKick.kickable)
            return message.reply("I can't kick that person due to role hierarchy, I suppose.").then(m => del(m, 7500));

        let reason = args.slice(1).join(" ");
        if (!reason) reason = "No reason given!";

        const embed = new MessageEmbed()
            .setColor("#ff0000")
            .setTitle("Member Kicked")
            .setThumbnail(toKick.user.displayAvatarURL())
            .setFooter(message.member.displayName, message.author.displayAvatarURL())
            .setTimestamp()
            .setDescription(stripIndents`
            **Kicked member:** ${toKick} (${toKick.id})
            **Kicked by:** ${message.member}
            **Reason:** ${reason}`);

        const promptEmbed = new MessageEmbed()
            .setColor("GREEN")
            .setAuthor(`This verification becomes invalid after 30s.`)
            .setDescription(`Do you want to kick ${toKick}?`)

        await s(message.channel, '', promptEmbed).then(async msg => {
            const emoji = await promptMessage(msg, message.author, 30, ["✅", "❌"]);

            if (emoji === "✅") {
                del(msg, 0);

                toKick.kick(reason).then(() => {
                    toKick.send(`Hello, you have been **kicked** in ${message.guild.name} for: **${reason}**`).catch(err => err); //in case DM's are closed
                    message.reply(`${toKick.user.username}(${toKick.user.id}) was successfully kicked.`).then(m => del(m, 7500));
                    return s(logChannel, '', embed).catch(err => err);
                }).catch(err => {
                    if (err) return message.reply(`There was an error attempting to kick ${toKick} ${err}`).then(m => del(m, 7500));
                });
            } else if (emoji === "❌") {
                del(msg, 0);
                return message.reply(`Kick cancelled.`).then(m => del(m, 7500));
            } else return del(msg, 0);
        }).catch(err => err);
    }
};