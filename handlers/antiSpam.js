const { readdirSync } = require("fs")

module.exports = (client) => {
    const load = () => {
        const events = readdirSync(`./events/antiSpam/`).filter(d => d.endsWith('.js'));
        for (let file of events) {
            const evt = require(`../events/antiSpam/${file}`);
            let eName = file.split('.')[0];
            client.antiSpam.on(eName, evt.bind(null, client));
        };
    };
    ["antiSpam"].forEach(x => load(x));
};
