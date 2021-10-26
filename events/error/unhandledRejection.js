const fs = require("fs");

module.exports = async (client, process, reason, promise) => {
    const time = new Date();
    time.toLocaleString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true });

    var dir = './logs';

    if (!fs.existsSync(dir)) fs.mkdirSync(dir);

    fs.appendFile(`${dir}/${time} UnhandledRejection.log`, `${time}: A new unhandledRejection: at promise ${promise} ${reason}\n`, (err) => {
        if (err) throw err;
        console.log(`A new UnhandledRejection has been logged to: ${time} UnhandledRejection.log`);
    });

    let owner = await client.users.fetch(`${process.env.USERID}`);
    owner.send(`${time}: A new unhandledRejection error ${promise} ${reason}`).catch(err => console.log(`Could not send unhandledRejection error message to owner. ${err}`));
}