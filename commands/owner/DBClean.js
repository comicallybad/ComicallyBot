const { del } = require("../../functions.js");
const db = require("../../schemas/db.js")

module.exports = {
    name: "dbclean",
    aliases: ["dbcleaup"],
    category: "owner",
    description: "Cleans DB database from unused guilds.",
    permissions: "admin",
    run: (client, message, args) => {
        if (message.author.id != process.env.USERID)
            return message.reply("You're not the bot the owner!").then(m => del(m, 7500));

        const currentGuilds = client.guilds.cache.map(guild => guild.id)

        db.find().then(data => {
            const dbGuilds = data.map(guild => guild.guildID)
            dbGuilds.forEach(ID => {
                if (!currentGuilds.includes(ID)) {
                    db.deleteOne({ guildID: ID })
                        .catch(err => message.reply(`There was an error cleaning empty database listings. ${err}`).then(m => del(m, 7500)))
                }
            })
            return message.reply("DB database has been cleaned up.").then(m => del(m, 7500))
        }).catch(err => message.reply(`There was an error cleaning empty database listings. ${err}`).then(m => del(m, 7500)))
    }
}