const { s, r, del } = require("../../functions.js");
const { stripIndents } = require("common-tags");
const { spawn } = require('child_process');

//MongoDB Tools is required for this method of backup
module.exports = {
    name: "createbackup",
    aliases: ["backup"],
    category: "owner",
    description: "Creates a backup JSON file for the xps and dbs databases.",
    permissions: "owner",
    run: async (client, message, args) => {
        if (message.author.id != process.env.USERID)
            return r(message.channel, message.author, "You're not the bot the owner!").then(m => del(m, 7500));

        const date = new Date();
        const formatDate = stripIndents`
            ${(date.getMonth() + 1)
                .toString().padStart(2, '0')}-${date.getDate()
                    .toString().padStart(2, '0')}-${date.getFullYear()
                        .toString().padStart(4, '0')}`

        const dbsBackup = spawn('mongoexport', [
            '--db', 'ComicallyBot',
            '--collection', 'dbs',
            '--out', `../ComicallyBot-Backups/dbs-${formatDate}.json`,
        ]);

        dbsBackup.on('exit', (code, signal) => {
            if (code) return s(message.channel, `Backup exitted with code: ${code}`).then(m => del(m, 7500));
            else if (signal) return s(message.channel, `Backup process killed with signal: ${signal}`).then(m => del(m, 7500));
            else return s(message.channel, `The dbs collection was successfully backupped.`).then(m => del(m, 7500));
        });

        const xpsBackup = spawn('mongoexport', [
            '--db', 'ComicallyBot',
            '--collection', 'xps',
            '--out', `../ComicallyBot-Backups/xps-${formatDate}.json`,
        ]);

        return xpsBackup.on('exit', (code, signal) => {
            if (code) return s(message.channel, `Backup exitted with code: ${code}`).then(m => del(m, 7500));
            else if (signal) return s(message.channel, `Backup process killed with signal: ${signal}`).then(m => del(m, 7500));
            else return s(message.channel, `The xps collection was successfully backupped.`).then(m => del(m, 7500));
        });
    }
}