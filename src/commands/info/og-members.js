const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { r, delr, pageList } = require("../../../utils/functions/functions.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("og-members")
        .setDescription("Shows a list of earliest users in the discord server."),
    async execute(interaction) {
        const date = new Date();
        const sorted = interaction.guild.members.cache.sort((a, b) => a.joinedAt - b.joinedAt).map(x => x);
        const array = sorted.map(user => `**${user.nickname ? user.nickname : user.user.username}** (\`${user.user.tag}\`)
        **Joined:** ${user.joinedAt.toDateString()} (\`${Math.round((date.getTime() - user.joinedAt.getTime()) / 86400000)
                .toLocaleString("en-US")}\` **DAYS AGO!)**`);

        const embed = new EmbedBuilder()
            .setTitle("Top OG Members")
            .setDescription(`Member count: ${sorted.length}`)
            .setColor("#0efefe")
            .setTimestamp()

        if (array.length === 0) {
            embed.addFields({ name: "OG Members", value: "No members found." });
            return r(interaction, "", embed).then(() => delr(interaction, 30000));
        } else if (array.length <= 10) {
            array.forEach((user, index) => {
                embed.addFields({ name: `OG Member #: ${index + 1}`, value: `${user}` });
            });
            return r(interaction, '', embed).then(() => delr(interaction, 30000));
        } else {
            await r(interaction, "", embed);
            return pageList(interaction, array, embed, "OG Member #", 10, 0);
        }
    }
}