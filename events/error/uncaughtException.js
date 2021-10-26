const fs = require("fs");
const { stripIndents } = require("common-tags");

module.exports = async (client, process, error, origin) => {
    const date = new Date();
    const formatDate = stripIndents`
    ${(date.getMonth() + 1)
            .toString().padStart(2, '0')}-${date.getDate()
                .toString().padStart(2, '0')}-${date.getFullYear()
                    .toString().padStart(4, '0')}`

    const formatTime = stripIndents`${date.getHours()
        .toString().padStart(2, '0')}-${date.getMinutes()
            .toString().padStart(2, '0')}-${date.getSeconds()
                .toString().padStart(2, '0')}`

    var dir = './logs';

    if (!fs.existsSync(dir)) fs.mkdirSync(dir);

    fs.appendFile(`./logs/${formatDate} UncaughtException.log`, `${formatDate} ${formatTime} A new uncaughtExcemption error: ${error.stack} at: ${origin}\n`, function (err) {
        if (err) throw err;
        console.log(`A new UncaughtException has been logged to: ${formatDate} UncaughtException.log`);
    });

    let owner = await client.users.fetch(`${process.env.USERID}`);
    owner.send(`${formatDate} ${formatTime} A new uncaughtExcemption error: ${error.stack} at: ${origin}`).catch(err => console.log(`Could not send uncaughtExcemption error message to owner. ${err}`));
}