const fs = require("fs");

module.exports = async (client, process, error) => {
    const time = new Date();
    time.toLocaleString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true });

    var dir = './logs';

    if (!fs.existsSync(dir)) fs.mkdirSync(dir);

    fs.appendFile(`${dir}/${time} warning.log`, `${time}: ${error.stack}\n`, (err) => {
        if (err) throw err;
        console.log(`A new warning has been logged to: ${time} warning.log`);
    });

    let owner = await client.users.cache.get(`${process.env.USERID}`);
    owner.send(`${time} A new warning: ${error.stack}`).catch(err => console.log(`Could not send warning error message to owner. ${err}`));
}