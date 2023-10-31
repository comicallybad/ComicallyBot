const { s, r, re, findID } = require("../../../utils/functions/functions.js");
const db = require("../../../utils/schemas/db.js");
const { stripIndents } = require("common-tags");
const { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("addmod")
        .setDescription("Add permitted role(s)/user(s) for mod commands.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addMentionableOption(option => option.setName("target").setDescription("User/Role to be added.").setRequired(true)),
    execute: async (client, interaction) => {
        const logChannel = interaction.guild.channels.cache.find(c => c.name.includes("mod-logs")) || interaction.channel;
        let guildID = interaction.guild.id;
        let roleNames = interaction.guild.roles.cache.map(role => role.name);
        let roleIDs = interaction.guild.roles.cache.map(role => role.id);
        let userNames = interaction.guild.members.cache.map(user => user.user.username);
        let userIDs = interaction.guild.members.cache.map(user => user.user.id);

        let ID = await findID(interaction, interaction.options.get("target").value);
        if (!ID) return re(interaction, "user/role not found.");

        //if it is a role
        if (roleIDs.includes(ID))
            return addMod(roleNames[roleIDs.indexOf(ID)], ID)

        //if it is a user
        if (userIDs.includes(ID))
            return addMod(userNames[userIDs.indexOf(ID)], ID)

        function addMod(roleName, roleID) {
            return db.findOne({
                guildID: guildID, modRoles: { $elemMatch: { roleName: roleName, roleID: roleID } }
            }, (err, exists) => {
                if (exists) return re(interaction, "User/role already added.");
                db.updateOne({ guildID: guildID }, {
                    $push: { modRoles: { roleName: roleName, roleID: roleID } }
                }).then(() => {
                    const embed = new EmbedBuilder()
                        .setColor("#0efefe")
                        .setTitle("Mod Added")
                        .setThumbnail(interaction.user.displayAvatarURL())
                        .setFooter({ text: interaction.member.displayName, iconURL: interaction.user.displayAvatarURL() })
                        .setTimestamp()
                        .setDescription(stripIndents`
                        **Mod Added By:** ${interaction.member.user}
                        **Role/User Added:** ${roleName} (${roleID})`);

                    s(logChannel, '', embed);

                    return r(interaction, "Mod added.");
                }).catch(err => re(interaction, `There was an error adding this mod: ${err}`));
            }).catch(err => err);
        }
    }
}