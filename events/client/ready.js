const mongoose = require("mongoose");
const { dbSetup } = require("../../dbFunctions.js")

module.exports = client => {
    console.log(`${client.user.username} online.`);

    client.user.setPresence({
        status: "online",
        game: {
            name: prefix + "help",
            type: "STREAMING"
        }
    });
    mongoose.connect("mongodb://localhost/ComicallyBOT2", {
        useUnifiedTopology: true,
        useNewUrlParser: true
    });
    dbSetup(client);
}