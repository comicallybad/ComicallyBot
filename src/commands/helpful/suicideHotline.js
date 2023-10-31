const { s, r, del } = require("../../../utils/functions/functions.js");

module.exports = {
    name: "suicidehotline",
    aliases: ["suicide", "hotline", "mentalsupport"],
    category: "helpful",
    description: "Sends a link to a list of suicide hotline numbers.",
    permissions: "member",
    run: (client, message, args) => {
        return s(message.channel, "http://www.suicide.org/international-suicide-hotlines.html").then(m => del(m, 30000));
    }
}