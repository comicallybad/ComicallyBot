const { s, r, del, messagePrompt } = require("../../functions.js");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "kick",
    category: "moderation",
    description: "Kick a member.",
    permissions: "moderator",
    usage: "<@user | userID>",
    run: async (client, message, args) => {
        if (!message.guild.me.permissions.has("KICK_MEMBERS"))
            return r(message.channel, message.author, "I don't have permission to kick members!").then(m => del(m, 7500));

        if (!args[0])
            return r(message.channel, message.author, "Please provide a member to be kicked!").then(m, del(m, 7500));

        const id = args[0].replace(/\D/g, '');
        const toKick = message.mentions.members.first() || id;
        if (!toKick || isNaN(id) || id.length < 18) return r(message.channel, message.author, "Could not find that member!").then(m => del(m, 7500));

        if (toKick.id == message.author.id || toKick.id == message.author.id)
            return r(message.channel, message.author, "You can't kick yourself...").then(m => del(m, 7500));

        let reason = args.slice(1).join(" ");
        if (!reason) reason = "No reason given!";

        const promptEmbed = new MessageEmbed()
            .setColor("GREEN")
            .setAuthor({ name: `This verification becomes invalid after 30s.` })
            .setDescription(`Do you want to kick ${toKick.id ? toKick : "<@" + toKick + ">"}?`)

        return s(message.channel, '', promptEmbed).then(async msg => {
            const emoji = await messagePrompt(msg, message.author, 30, ["✅", "❌"]);

            if (emoji === "✅") {
                del(msg, 0);

                message.guild.members.kick(toKick, reason).then(() => {
                    s(message.channel, `${toKick.id ? "<@" + toKick.id + ">" : "<@" + id + ">"} (${toKick.id ? toKick.id : id}) was successfully kicked.`).then(m => del(m, 7500));
                }).catch(err => r(message.channel, message.author, `There was an error attempting to kick ${toKick.id ? "<@" + toKick.id + ">" : "<@" + id + ">"}: ${err}`).then(m => del(m, 7500)));
            } else if (emoji === "❌") {
                del(msg, 0);
                return r(message.channel, message.author, `Kick cancelled.`).then(m => del(m, 7500));
            } else return del(msg, 0);
        }).catch(err => err);
    }
}