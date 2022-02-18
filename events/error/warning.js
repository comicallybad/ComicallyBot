const fs = require("fs");
const { stripIndents } = require("common-tags");

module.exports = async (client, process, error) => {
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

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }

    fs.appendFile(`./logs/${formatDate} warning.log`, `${formatDate} ${formatTime}: ${error.stack}\n`, function (err) {
        if (err) throw err;
        console.log(`A new warning has been logged to: ${formatDate} warning.log`)
    });

    let owner = await client.users.fetch(`${process.env.USERID}`);
    owner.send(`New warning ${error.stack}`).catch(err => console.log(`Could not send warning error message to owner. ${err}`));
}