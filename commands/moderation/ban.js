const { s, r, del, messagePrompt } = require("../../functions.js");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "ban",
    category: "moderation",
    description: "Ban a member.",
    permissions: "moderator",
    usage: "<@user | userID> [reason]",
    run: async (client, message, args) => {
        if (!message.guild.me.permissions.has("BAN_MEMBERS"))
            return r(message.channel, message.author, "I don't have permission to ban members!").then(m => del(m, 7500));

        if (!args[0])
            return r(message.channel, message.author, "Please provide a member to be banned!").then(m => del(m, 7500));

        const id = args[0].replace(/\D/g, '');
        const toBan = message.mentions.members.first() || id;
        if (!toBan || isNaN(id) || id.length < 18) return r(message.channel, message.author, "Could not find that member!").then(m => del(m, 7500));

        if (toBan.id == message.author.id || id == message.author.id)
            return r(message.channel, message.author, "You can't ban yourself...").then(m => del(m, 7500));

        let reason = args.slice(1).join(" ")
        if (!reason) reason = "No reason given!"

        const promptEmbed = new MessageEmbed()
            .setColor("GREEN")
            .setAuthor({ name: `This verification becomes invalid after 30s.` })
            .setDescription(`Do you want to ban ${toBan.id ? toBan : "<@" + toBan + ">"}?`)

        return s(message.channel, '', promptEmbed).then(async msg => {
            const emoji = await messagePrompt(msg, message.author, 30, ["✅", "❌"]);

            if (emoji === "✅") {
                del(msg, 0);

                message.guild.bans.create(toBan.id ? toBan.id : id, { reason: `${reason}`, deleteMessageSeconds: 604800 }).then(() => {
                    s(message.channel, `${toBan.id ? "<@" + toBan.id + ">" : "<@" + id + ">"} (${toBan.id ? toBan.id : id}) was successfully banned.`).then(m => del(m, 7500));
                }).catch(err => r(message.channel, message.author, `There was an error attempting to ban ${toBan.id ? "<@" + toBan.id + ">" : "<@" + id + ">"}: ${err}`).then(m => del(m, 7500)));
            } else if (emoji === "❌") {
                del(msg, 0);
                return r(message.channel, message.author, `Ban cancelled.`).then(m => del(m, 7500));
            } else return del(msg, 0);
        }).catch(err => err);
    }
}