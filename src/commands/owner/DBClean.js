const { s, del } = require("../../../utils/functions/functions.js");
const db = require("../../../utils/schemas/db.js");

module.exports = {
    name: "dbclean",
    category: "owner",
    description: "Cleans DB database from unused guilds.",
    permissions: "owner",
    run: (client, message, args) => {
        if (message.author.id != process.env.USERID)
            return s(message.channel, "You're not the bot the owner!").then(m => del(m, 7500));

        const currentGuilds = client.guilds.cache.map(guild => guild.id);

        return db.find().then(guilds => {
            guilds.forEach(guild => {
                if (!currentGuilds.includes(guild.guildID)) {
                    db.deleteOne({ guildID: guild.guildID })
                        .catch(err => s(message.channel, `There was an error cleaning empty DB schemas. ${err}`).then(m => del(m, 7500)));
                }
            });
            return s(message.channel, "DB database has been cleaned up.").then(m => del(m, 7500));
        }).catch(err => s(message.channel, `There was an error cleaning guild database: ${err}`).then(m => del(m, 7500)));
    }
}