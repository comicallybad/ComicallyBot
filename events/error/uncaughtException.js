const fs = require("fs");

module.exports = async (client, process, error, origin) => {
    const time = new Date();
    time.toLocaleString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true });

    var dir = './logs';

    if (!fs.existsSync(dir)) fs.mkdirSync(dir);

    fs.appendFile(`${dir}/${time} UncaughtException.log`, `${time} A new uncaughtExcemption error: ${error.stack} at: ${origin}\n`, (err) => {
        if (err) throw err;
        console.log(`A new UncaughtException has been logged to: ${time} UncaughtException.log`);
    });

    let owner = await client.users.fetch(`${process.env.USERID}`);
    owner.send(`${time} A new uncaughtExcemption error: ${error.stack} at: ${origin}`).catch(err => console.log(`Could not send uncaughtExcemption error message to owner. ${err}`));
}