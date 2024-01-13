const fs = require("fs");

module.exports = async (client, process, reason, promise) => {
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

    fs.appendFile(`./logs/${formatDate} unhandledRejection.log`, `${formatDate} ${formatTime}: A new unhandledRejection: ${promise}\n${reason.stack}\n`, function (err) {
        if (err) throw err;
        console.error(`A new unhandledRejection has been logged to: ${formatDate} unhandledRejection.log`)
    });

    let owner = await client.users.fetch(`${process.env.USERID}`);
    owner.send(`${formatDate} ${formatTime}: A new unhandledRejection error: \`${promise}\`\n\`\`\`prolog\n${reason.stack}\`\`\``)
        .catch(err => console.log(`Could not send unhandledRejection error message to owner. ${err}`));
}