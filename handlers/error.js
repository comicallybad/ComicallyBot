const { readdirSync } = require("fs")

module.exports = (process) => {
    const load = () => {
        const events = readdirSync(`./events/error/`).filter(d => d.endsWith('.js'));
        for (let file of events) {
            const evt = require(`../events/error/${file}`);
            let eName = file.split('.')[0];
            process.on(eName, evt.bind(null, process));
        };
    };
    ["error"].forEach(x => load(x));
};