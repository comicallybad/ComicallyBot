const fs = require("fs");
const { stripIndents } = require("common-tags");

module.exports = (process, error) => {
    const date = new Date();
    const formatDate =
        stripIndents`
        ${(date.getMonth() + 1).toString().padStart(2, '0')}-${
            date.getDate().toString().padStart(2, '0')}-${
            date.getFullYear().toString().padStart(4, '0')} ${
            date.getHours().toString().padStart(2, '0')}-${
            date.getMinutes().toString().padStart(2, '0')}-${
            date.getSeconds().toString().padStart(2, '0')}`

    var dir = './logs';

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }

    fs.writeFile(`./logs/${formatDate}.log`, `${formatDate}: ${error}`, function (err) {
        if (err) throw err;
        console.log("A new error has been logged.")
    });
}