const { s, r, del, promptMessage } = require("../../functions.js");
const { stripIndents } = require("common-tags");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "addrole",
    category: "moderation",
    description: "Add user to a role.",
    permissions: "moderator",
    usage: "<@user | userID> <@role | roleID>",
    run: async (client, message, args) => {
        const logChannel = message.guild.channels.cache.find(c => c.name.includes("mod-logs")) || message.channel;

        if (!message.guild.me.permissions.has("MANAGE_ROLES"))
            return r(message.channel, message.author, "I don't have permission to manage roles!").then(m => del(m, 7500));

        let user = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!user) return r(message.channel, message.author, "Please provide a user to be added to a role!").then(m => del(m, 7500));

        if (user.id === message.author.id)
            if (user.id !== process.env.USERID)
                return r(message.channel, "You can't give yourself roles...").then(m => del(m, 7500));

        const roleName = args.slice(1).join(" ");

        let role = message.guild.roles.cache.find(r => r.name === roleName) || message.guild.roles.cache.find(r => r.id === args[1]) || message.mentions.roles.first();

        if (!role)
            return r(message.channel, message.author, "Could not find role.").then(m => del(m, 7500));

        const embed = new MessageEmbed()
            .setColor("#0efefe")
            .setTitle("Member Added To Role")
            .setThumbnail(user.user.displayAvatarURL())
            .setFooter({ text: message.member.displayName, iconURL: message.author.displayAvatarURL() })
            .setTimestamp()
            .setDescription(stripIndents`
            **Role Added To:** ${user} (${user.id})
            **Role Added By:** ${message.member}
            **Role Added:** ${role} (${role.id})`);

        const promptEmbed = new MessageEmbed()
            .setColor("GREEN")
            .setAuthor({ name: `This verification becomes invalid after 30s.` })
            .setDescription(`Do you want to add ${user} to then **${role.name}** role?`)

        await s(message.channel, '', promptEmbed).then(async msg => {
            const emoji = await promptMessage(msg, message.author, 30, ["✅", "❌"]);

            if (emoji === "✅") {
                del(msg, 0);

                user.roles.add(role.id).then(() => {
                    r(message.channel, message.author, `${user} was successfully added to the **${role.name}** role.`).then(m => del(m, 7500));
                    return s(logChannel, '', embed);
                }).catch(err => {
                    if (err) return r(message.channel, message.author, `There was an error attempting to add ${user} to the ${role.name} role: ${err}`).then(m => del(m, 7500));
                });
            } else if (emoji === "❌") {
                del(msg, 0);
                return r(message.channel, message.author, `Role add cancelled.`).then(m => del(m, 7500));
            } else return del(msg, 0);
        }).catch(err => err);
    }
}