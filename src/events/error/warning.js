const fs = require("fs");

module.exports = async (client, process, error) => {
    const date = new Date();
    const formatDate = `${(date.getMonth() + 1)
        .toString().padStart(2, '0')}-${date.getDate()
            .toString().padStart(2, '0')}-${date.getFullYear()
                .toString().padStart(4, '0')}`

    const formatTime = `${date.getHours()
        .toString().padStart(2, '0')}-${date.getMinutes()
            .toString().padStart(2, '0')}-${date.getSeconds()
                .toString().padStart(2, '0')}`

    var dir = './logs';

    if (!fs.existsSync(dir)) fs.mkdirSync(dir);

    fs.appendFile(`./logs/${formatDate} warning.log`, `${formatDate} ${formatTime}: A new warning:\n${error.stack}\n`, function (err) {
        if (err) throw err;
        console.warn(`A new warning has been logged to: ${formatDate} warning.log`)
    });

    const owner = await client.users.fetch(`${process.env.USERID}`);
    owner.send(`${formatDate} ${formatTime}: A new warning:\n\`\`\`prolog\n${error.stack}\`\`\``)
        .catch(err => console.log(`Could not send warning error message to owner. ${err}`));
}