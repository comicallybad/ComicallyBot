const { s, r, del, promptMessage } = require("../../functions.js");
const { stripIndents } = require("common-tags");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "removerole",
    category: "moderation",
    description: "Removes user from a role.",
    permissions: "moderator",
    usage: "<@user | userID> <@role | roleID>",
    run: async (client, message, args) => {
        const logChannel = message.guild.channels.cache.find(c => c.name.includes("mod-logs")) || message.channel;

        if (!message.guild.me.permissions.has("MANAGE_ROLES"))
            return r(message.channel, message.author, "I don't have permission to manage roles!").then(m => del(m, 7500));

        let user = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!user) return r(message.channel, message.author, "Please provide a user to be added to a role!").then(m => del(m, 7500));

        if (user.id === message.author.id)
            return r(message.channel, message.author, "You can't remove your own roles...").then(m => del(m, 7500));

        const roleName = args.slice(1).join(" ");

        let role = message.guild.roles.cache.find(r => r.name === roleName) || message.guild.roles.cache.find(r => r.id === args[1]) || message.mentions.roles.first();

        if (!role)
            return r(message.channel, message.author, "Could not find role.").then(m => del(m, 7500));

        const embed = new MessageEmbed()
            .setColor("#0efefe")
            .setTitle("Member Removed From Role")
            .setThumbnail(user.user.displayAvatarURL())
            .setFooter(message.member.displayName, message.author.displayAvatarURL())
            .setTimestamp()
            .setDescription(stripIndents`
            **Role removed from:** ${user} (${user.id})
            **Role removed by:** ${message.member}
            **Role removed:** ${role} (${role.id})`);

        const promptEmbed = new MessageEmbed()
            .setColor("GREEN")
            .setAuthor(`This verification becomes invalid after 30s.`)
            .setDescription(`Do you want to remove ${user} to the **${role.name}** role?`)

        await s(message.chanel, '', promptEmbed).then(async msg => {
            const emoji = await promptMessage(msg, message.author, 30, ["✅", "❌"]);

            if (emoji === "✅") {
                del(msg, 0);

                user.roles.remove(role.id).then(() => {
                    r(message.channel, message.author, `${user} was successfully removed from the **${role.name}** role.`).then(m => del(m, 7500));
                    return s(logChannel, '', embed);
                }).catch(err => {
                    if (err) return r(message.channel, message.author, `There was an error attempting to remove ${user} from the ${role.name} role: ${err}`).then(m => del(m, 7500));
                })
            } else if (emoji === "❌") {
                del(msg, 0);
                return r(message.channel, message.author, `Role remove cancelled.`).then(m => del(m, 7500));
            } else return del(msg, 0);
        }).catch(err => err);
    }
}