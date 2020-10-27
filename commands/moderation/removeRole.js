const { del, promptMessage } = require("../../functions.js");
const { stripIndents } = require("common-tags");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "removerole",
    aliases: ["roleremove"],
    category: "moderation",
    description: "Removes user from a role.",
    permissions: "moderator",
    usage: "<@user | userID> <@role | roleID>",
    run: async (client, message, args) => {
        const logChannel = message.guild.channels.cache.find(c => c.name === "mod-logs") || message.channel;

        if (!message.guild.me.hasPermission("MANAGE_ROLES"))
            return message.reply("I don't have permission to manage roles!").then(m => del(m, 7500));

        let user = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!user) return message.reply("Please provide a user to be added to a role!").then(m => del(m, 7500));

        if (user.id === message.author.id)
            return message.reply("You can't remove your own roles...").then(m => del(m, 7500));

        const roleName = args.slice(1).join(" ");

        let role = message.guild.roles.cache.find(r => r.name === roleName) || message.guild.roles.cache.find(r => r.id === args[1]);

        if (!role)
            return message.reply("Could not find role.").then(m => del(m, 7500));

        const embed = new MessageEmbed()
            .setColor("#0efefe")
            .setTitle("User Removed From Role")
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

        await message.channel.send(promptEmbed).then(async msg => {
            const emoji = await promptMessage(msg, message.author, 30, ["✅", "❌"]);

            if (emoji === "✅") {
                del(msg, 0);

                user.roles.remove(role.id).then(() => {
                    user.send(`Hello, you have been removed from the **${role.name}** role in ${message.guild.name}`).catch(err => err); //in case DM's are closed
                    message.reply(`${user} was successfully removed from the **${role.name}** role.`).then(m => del(m, 7500));
                    logChannel.send(embed);
                }).catch(err => {
                    if (err) return message.reply(`There was an error attempting to remove ${user} from the ${role.name} role: ${err}`).then(m => del(m, 7500));
                })
            } else if (emoji === "❌") {
                del(msg, 0);
                return message.reply(`Role remove cancelled.`).then(m => del(m, 7500));
            } else {
                return del(msg, 0);
            }
        }).catch(err => console.log(`There was an error in removing the role ${err}`));
    }
}