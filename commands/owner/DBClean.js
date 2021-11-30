const { del } = require("../../functions.js");
const db = require("../../schemas/db.js");

module.exports = {
    name: "dbclean",
    aliases: ["dbcleaup"],
    category: "owner",
    description: "Cleans DB database from unused guilds.",
    permissions: "owner",
    run: (client, message, args) => {
        if (message.author.id != process.env.USERID)
            return r(message.channel, message.author, "You're not the bot the owner!").then(m => del(m, 7500));

        const currentGuilds = client.guilds.cache.map(guild => guild.id)

        db.find().then(guild => {
            const guildIDs = guild.map(guild => guild.guildID)
            guildIDs.forEach(ID => {
                if (!currentGuilds.includes(ID)) {
                    db.deleteOne({ guildID: ID })
                        .catch(err => message.reply(`There was an error cleaning empty database listings. ${err}`).then(m => del(m, 7500)));
                }
            });
            return r(message.channel, message.author, "DB database has been cleaned up.").then(m => del(m, 7500));
        }).catch(err => message.reply(`There was an error cleaning guild database: ${err}`).then(m => del(m, 7500)));
    }
}