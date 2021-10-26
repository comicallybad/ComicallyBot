const { del } = require("../../functions.js");
const fs = require("fs");
const db = require("../../schemas/db.js");
const xp = require("../../schemas/xp.js");

module.exports = {
    name: "createbackup",
    aliases: ["backup"],
    category: "owner",
    description: "Creates a backup JSON file for the xps and dbs databases.",
    permissions: "owner",
    run: (client, message, args) => {
        if (message.author.id != process.env.USERID)
            return message.reply("You're not the bot the owner!").then(m => del(m, 7500));

        var dir = './backups';

        if (!fs.existsSync(dir)) fs.mkdirSync(dir);

        db.find().then(data => {
            fs.appendFile(`${dir}/${time} dbs-backup.json`, `${data}`, (err) => {
                if (err) throw err;
                console.log(`A new warning has been logged to: ${time} warning.log`);
            });
            return message.reply("Your dbs database has been backed up.").then(m => del(m, 7500));
        }).catch(err => message.reply(`There was an error backing up the dbs database. ${err}`).then(m => del(m, 7500)));

        xp.find().then(data => {
            fs.appendFile(`${dir}/${time} xps-backup.json`, `${data}`, (err) => {
                if (err) throw err;
                console.log(`A new warning has been logged to: ${time} warning.log`);
            });
            return message.reply("Your dbs database has been backed up.").then(m => del(m, 7500));
        }).catch(err => message.reply(`There was an error backing up the dbs database. ${err}`).then(m => del(m, 7500)));
    }
}