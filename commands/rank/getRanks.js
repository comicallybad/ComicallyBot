const db = require("../../schemas/db.js");
const { RichEmbed } = require("discord.js")

module.exports = {
    name: "getranks",
    aliases: ["ranks", "listranks"],
    category: "rank",
    description: "Lists of ranks that can be purchased with coins.",
    permissions: "moderator",
    usage: "<@role|roleID> <cost>",
    run: async (client, message, args) => {
        if (message.deletable) message.delete()

        const guildID = message.guild.id;

        const embed = new RichEmbed()
            .setColor("#0efefe")
            .setTitle("Buyable Ranks")
            .setFooter(message.guild.me.displayName, client.user.displayAvatarURL)
            .setDescription("List of buyable ranks")
            .setTimestamp();

        const m = await message.channel.send(embed);

        db.findOne({ guildID: guildID }, (err, exists) => {
            if (err) console.log(err);
            if (exists.buyableRanks.length > 0) {
                let rankList = exists.buyableRanks.map(rank => "Name: " + `\`${rank.roleName}\`` + ", ID: " + `\`${rank.roleID}\`` + ", Cost: " + `\`${rank.cost}\``);
                embed.setDescription("").addField("Ranks: ", rankList);
                m.edit(embed).then(m => m.delete(30000));
            } else {
                embed.setDescription("").addField("Ranks: ", "There have been no buyable ranks set");
                m.edit(embed).then(m => m.delete(30000));
            }
        }).catch(err => console.log(err))
    }
}