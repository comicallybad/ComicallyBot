const { readdirSync } = require("fs");
const process = require('node:process');

module.exports = (client) => {
    const load = () => {
        const events = readdirSync(`./src/events/error/`).filter(d => d.endsWith('.js'));
        for (let file of events) {
            const evt = require(`../events/error/${file}`);
            let eName = file.split('.')[0];
            process.on(eName, evt.bind(null, client, process));
        };
    };
    ["error"].forEach(x => load(x));
};