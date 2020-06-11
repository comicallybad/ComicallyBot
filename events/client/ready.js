const { del } = require("../../functions.js");
const mongoose = require("mongoose");
const { dbSetup } = require("../../dbFunctions.js");
const { ErelaClient, Utils } = require("erela.js");
const { stripIndents } = require("common-tags");

module.exports = client => {
    const date = new Date()
    console.log(stripIndents`${client.user.username} online. 
    ${(date.getMonth() + 1).toString().padStart(2, '0')}/${
        date.getDate().toString().padStart(2, '0')}/${
        date.getFullYear().toString().padStart(4, '0')} ${
        date.getHours().toString().padStart(2, '0')}:${
        date.getMinutes().toString().padStart(2, '0')}:${
        date.getSeconds().toString().padStart(2, '0')}`
    );

    global.activities = [`${client.guilds.cache.size} servers!`, `${client.channels.cache.size} channels!`, `${client.users.cache.size} users!`], i = 0;
    setInterval(() => client.user.setActivity(`${prefix}help | ${activities[i++ % activities.length]}`, { type: "PLAYING" }), 7500)

    mongoose.connect("mongodb://localhost/ComicallyBOT2", {
        useUnifiedTopology: true,
        useNewUrlParser: true
    });

    dbSetup(client);

    client.music = new ErelaClient(client, [{ "host": "localhost", "port": 2333, "password": process.env.ERELA }])
        .on("nodeError", () => console.log("Error connecting Erela"))
        .on("nodeConnect", () => console.log("Successfully connected Erela."))
        .on("queueEnd", player => {
            player.textChannel.send("Queue has ended.").then(m => del(m, 30000));
            return client.music.players.destroy(player.guild.id)
        })
        .on("trackStart", ({ textChannel }, { title, duration }) => {
            textChannel.send(`Now playing: **${title}** \`${Utils.formatTime(duration, true)}\``).then(m => del(m, 30000));
        });
}