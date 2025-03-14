const { readdirSync } = require("fs")

module.exports = (client) => {
    const load = () => {
        const events = readdirSync(`./src/events/music/`).filter(d => d.endsWith('.js'));
        for (const file of events) {
            const evt = require(`../events/music/${file}`);
            const eName = file.split('.')[0];
            client.music.on(eName, evt.bind(null, client));
        };
    };
    ["music"].forEach(x => load(x));
};