const { r, del } = require("../../functions.js");
const { stripIndents } = require("common-tags");
const fs = require("fs");
const db = require("../../schemas/db.js");
const xp = require("../../schemas/xp.js");

module.exports = {
    name: "createbackup",
    aliases: ["backup", "backups"],
    category: "owner",
    description: "Creates a backup JSON file for the xps and dbs databases.",
    permissions: "owner",
    run: async (client, message, args) => {
        try {
            if (message.author.id != process.env.USERID)
                return r(message.channel, message.author, "You're not the bot the owner!").then(m => del(m, 7500));

            console.log("inside backups")

            const date = new Date();
            const formatDate = stripIndents`${(date.getMonth() + 1)
                .toString().padStart(2, '0')}-${date.getDate()
                    .toString().padStart(2, '0')}-${date.getFullYear()
                        .toString().padStart(4, '0')}`

            const formatTime = stripIndents`${date.getHours()
                .toString().padStart(2, '0')}-${date.getMinutes()
                    .toString().padStart(2, '0')}-${date.getSeconds()
                        .toString().padStart(2, '0')}`

            const dir = './backups';

            if (!fs.existsSync(dir)) fs.mkdirSync(dir);

            let guildsID = await client.guilds.cache.map(guild => guild.id);

            guildsID.forEach((element, guildIndex) => {
                db.findOne({ guildID: guildsID[guildIndex] }, (err, exists) => {
                    if (exists) exists.map(guild => guild).forEach(guild => {
                        fs.appendFile(`./backups/${formatDate} ${formatTime} dbs-backup.json`, `${guild}`, function (err) {
                            if (err) throw err;
                            console.log(`A new warning has been logged to: ${formatDate} ${formatTime} warning.log`);
                        });
                    });
                    xp.findOne({ guildID: guildsID[guildIndex] }, (err, exists) => {
                        if (exists) exists.map(guild => guild).forEach(guild => {
                            fs.appendFile(`./backups/${formatDate} ${formatTime} xps-backup.json`, `${guild}`, function (err) {
                                if (err) throw err;
                                console.log(`A new warning has been logged to: ${formatDate} ${formatTime} warning.log`);
                            });
                        });
                    }).clone().catch(err => err);
                }).clone().catch(err => err);
            });
            return r(message.channel, message.author, "Your dbs database and xps database have been backed up.").then(m => del(m, 7500));
        } catch (err) {
            console.log(err)
        }
    }
}