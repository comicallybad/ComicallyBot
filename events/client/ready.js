const mongoose = require("mongoose");
const { dbSetup } = require("../../dbFunctions.js");

module.exports = client => {
    var time = new Date();
    console.log(time.toLocaleString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true }));

    global.activities = [`${client.guilds.cache.size} servers!`, `${client.channels.cache.size} channels!`, `${client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)} users!`], i = 0;
    setInterval(() => client.user.setActivity(`${prefix}help | ${activities[i++ % activities.length]}`, { type: "PLAYING" }), 7500)

    mongoose.connect("mongodb://0.0.0.0/ComicallyBOT2", { useUnifiedTopology: true, useNewUrlParser: true }).then(() => {
        console.log("Successfully connected to Mongodb");
        dbSetup(client);
    });

    client.music.init(client.user.id);
}