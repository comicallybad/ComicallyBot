const { s, e, del, pageList } = require("../../functions");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "ogmembers",
    aliases: ["ogusers", "ogs"],
    category: "info",
    description: "Shows a list of earliest users in the discord server.",
    permissions: "member",
    run: async (client, message, args) => {
        message.guild.members.fetch().then(async members => {
            const date = new Date();
            let sorted = members.sort((a, b) => a.joinedAt - b.joinedAt).map(user => user);

            const embed = new MessageEmbed()
                .setTitle("Top OG Members")
                .setDescription(`Member count: ${sorted.length}`)
                .setColor("#0efefe")
                .setTimestamp()

            const m = await s(message.channel, '', embed);

            if (sorted.length > 0) {
                if (sorted.length <= 10) {
                    sorted.forEach((user, index) => {
                        embed.addField(`OG Member #${index + 1}:`, `**${user.nickname ? user.nickname : user.user.username}** *(${user.user.tag})*
                            **Joined:** ${user.joinedAt.toDateString()} (***${Math.round((date.getTime() - user.joinedAt.getTime()) / 86400000).toLocaleString("en-US")} DAYS AGO!***)`);
                    });
                    return e(m, m.channel, '', embed).then(del(m, 30000));
                } else {
                    let array = sorted.map(user => `**${user.nickname ? user.nickname : user.user.username}** *(${user.user.tag})*
                        **Joined:** ${user.joinedAt.toDateString()} (***${Math.round((date.getTime() - user.joinedAt.getTime()) / 86400000).toLocaleString("en-US")} DAYS AGO!***)`);
                    pageList(m, message.author, array, embed, "OG Member #", 10, 0);
                }
            } else {
                embed.setDescription("").addField("OG Members", "There must have been an error.");
                return e(m, m.channel, '', embed).then(del(m, 30000));
            }
        });
    }
}