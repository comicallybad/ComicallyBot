const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { r, er, delr, pageList } = require("../../../utils/functions/functions.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("og-members")
        .setDescription("Shows a list of earliest users in the discord server."),
    async execute(interaction) {
        const date = new Date();
        let sorted = interaction.guild.members.cache.sort((a, b) => a.joinedAt - b.joinedAt).map(user => user);

        const embed = new EmbedBuilder()
            .setTitle("Top OG Members")
            .setDescription(`Member count: ${sorted.length}`)
            .setColor("#0efefe")
            .setTimestamp()

        await r(interaction, "", embed)

        if (sorted.length > 0) {
            if (sorted.length <= 10) {
                sorted.forEach((user, index) => {
                    embed.addFields({
                        name: `OG Member #${index + 1}:`, value: `**${user.nickname ? user.nickname : user.user.username}** (\`${user.user.tag}\`)
                        **Joined:** ${user.joinedAt.toDateString()} (\`${Math.round((date.getTime() - user.joinedAt.getTime()) / 86400000).toLocaleString("en-US")}\` **DAYS AGO!**)`
                    });
                });
                return er(interaction, "", embed).then(() => delr(interaction, 30000));
            } else {
                let array = sorted.map(user => `**${user.nickname ? user.nickname : user.user.username}** (\`${user.user.tag}\`)
                    **Joined:** ${user.joinedAt.toDateString()} (\`${Math.round((date.getTime() - user.joinedAt.getTime()) / 86400000).toLocaleString("en-US")}\` **DAYS AGO!)**`);
                pageList(interaction, array, embed, "OG Member #", 10, 0);
            }
        } else {
            embed.setDescription("").addFields({ name: "OG Members", value: "There must have been an error." });
            return er(interaction, "", embed).then(() => delr(interaction, 30000));
        }
    }
}