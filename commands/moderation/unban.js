const { s, r, del, messagePrompt } = require("../../functions.js");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "unban",
    category: "moderation",
    description: "Unban a member.",
    permissions: "moderator",
    usage: "<userID> [reason]",
    run: async (client, message, args) => {
        if (!message.member.permissions.has("BAN_MEMBERS"))
            return r(message.channel, message.author, "You don't have the ban members permission to perform this command!").then(m => del(m, 7500));

        if (!message.guild.me.permissions.has("BAN_MEMBERS"))
            return r(message.channel, message.author, "I don't have the permission to perform this command!").then(m => del(m, 7500));

        if (isNaN(args[0]))
            return r(message.channel, message.author, "You need to provide an ID.").then(m => del(m, 7500));

        let bannedMember = await client.users.fetch(args[0])
            .catch(err => s(message.channel, `There was a problem fetching that member. ${err}`).then(m => del(m, 7500)));

        if (!bannedMember)
            return r(message.channel, message.author, "Please provide a member id to unban someone!").then(m => del(m, 7500));

        let reason = args.slice(1).join(" ")
        if (!reason) reason = "No reason given!"

        const promptEmbed = new MessageEmbed()
            .setColor("GREEN")
            .setAuthor({ name: `This verification becomes invalid after 30s.` })
            .setDescription(`Do you want to unban ${bannedMember}?`)

        return s(message.channel, '', promptEmbed).then(async msg => {
            const emoji = await messagePrompt(msg, message.author, 30, ["✅", "❌"]);

            if (emoji === "✅") {
                del(msg, 0);

                message.guild.members.unban(bannedMember).then(() => {
                    return s(message.channel, `${bannedMember} (${bannedMember.id}) was successfully unbanned.`).then(m => del(m, 7500));
                }).catch(err => r(message.channel, message.author, `There was an error attempting to unban that member: ${err}`).then(m => del(m, 7500)));
            } else if (emoji === "❌") {
                del(msg, 0);
                return r(message.channel, message.author, `Unban cancelled.`).then(m => del(m, 7500));
            } else return del(msg, 0)
        }).catch(err => err);
    }
}