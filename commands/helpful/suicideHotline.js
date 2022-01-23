const { s, r, del } = require("../../functions.js");

module.exports = {
    name: "suicidehotline",
    aliases: ["suicide", "hotline", "mentalsupport"],
    category: "helpful",
    description: "Sends a link to a list of suicide hotline numbers.",
    permissions: "member",
    run: (client, message, args) => {
        s(message.channel, "http://www.suicide.org/international-suicide-hotlines.html").then(m => del(m, 30000));
        return r(message.channel, message.author, "Thank you for taking this step, these people are professional and are here to help. Don't be afraid, it's a good thing you are considering reaching out.").then(m => del(m, 15000));
    }
}