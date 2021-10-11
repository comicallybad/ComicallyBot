const mongoose = require("mongoose");
const { dbSetup } = require("../../dbFunctions.js");
const { stripIndents } = require("common-tags");

module.exports = client => {
    const date = new Date()
    console.log(stripIndents`${client.user.username} online. 
    ${(date.getMonth() + 1
        ).toString().padStart(2, '0')}/${date.getDate()
            .toString().padStart(2, '0')}/${date.getFullYear()
                .toString().padStart(4, '0')} ${date.getHours()
                    .toString().padStart(2, '0')}:${date.getMinutes()
                        .toString().padStart(2, '0')}:${date.getSeconds()
                            .toString().padStart(2, '0')}`
    );

    global.activities = [`${client.guilds.cache.size} servers!`, `${client.channels.cache.size} channels!`, `${client.users.cache.size} users!`], i = 0;
    setInterval(() => client.user.setActivity(`${prefix}help | ${activities[i++ % activities.length]}`, { type: "PLAYING" }), 7500)

    mongoose.connect("mongodb://localhost/ComicallyBOT2", {
        useUnifiedTopology: true,
        useNewUrlParser: true
    });

    dbSetup(client);

    client.music.init(client.user.id);
}