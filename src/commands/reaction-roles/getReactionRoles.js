const { s, e, del, pageList } = require("../../../utils/functions/functions.js");
const db = require("../../../utils/schemas/db.js");
const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "getreactionroles",
    aliases: ["reactionroles", "getrr"],
    category: "reaction-roles",
    description: "Gets a list of active reaction roles.",
    permissions: "moderator",
    run: async (client, message, args) => {
        const guildID = message.guild.id;

        const embed = new EmbedBuilder()
            .setColor("#0efefe")
            .setTitle("Reaction Roles")
            .setFooter({ text: message.guild.me.displayName, iconURL: client.user.displayAvatarURL() })
            .setDescription("List of server reaction roles.")
            .setTimestamp();

        const m = await s(message.channel, '', embed);

        return db.findOne({ guildID: guildID }, (err, exists) => {
            if (!exists) return;
            let reactionRoles = exists.reactionRoles
            if (reactionRoles.length > 0) {
                if (reactionRoles.length <= 10) {
                    reactionRoles.forEach((rr, index) => {
                        const reaction = rr.reaction;
                        embed.addFields({
                            name: `Reaction Role: ${index + 1}`,
                            value: `MessageID: \`${rr.messageID}\`\nReaction: ${reaction.length <= 17 ? reaction : message.guild.emojis.cache.get(reaction)}\nRole: \`${rr.roleName}(${rr.roleID})\`\nType: \`${rr.type}\`,`
                        });
                    });
                    return e(m, m.channel, '', embed).then(del(m, 30000));
                } else {
                    let array = reactionRoles.map(rr => `MessageID: \`${rr.messageID}\`\nReaction: ${rr.reaction.length <= 17 ? rr.reaction : message.guild.emojis.cache.get(rr.reaction)}\nRole: \`${rr.roleName}(${rr.roleID})\`\nType: \`${rr.type}\`,`);
                    pageList(m, message.author, array, embed, "Reaction Role:", 10, 0);
                }
            } else {
                embed.setDescription("").addFields({ name: "Reaction Roles", value: "There have been no reaction roles set." });
                return e(m, m.channel, '', embed).then(del(m, 30000));
            }
        }).catch(err => err)
    }
}