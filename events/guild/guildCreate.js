const mongoose = require("mongoose");
const db = require("../../schemas/db.js");

module.exports = (client, guild) => {
    let commands = (client.commands.map(cmd => cmd.name));
    db.findOne({ guildID: guild.id }, (err, exists) => {
        if (err) console.log(err)
        if (!exists) {
            const newDB = new db({
                _id: mongoose.Types.ObjectId(),
                guildID: guild.id,
                guildName: guild.name,
                commands: [],
                coinsMultiplier: 1
            })
            newDB.save().catch(err => console.log(err))
        } else {
            exists.guildName = guild.name; //in case name changed
            exists.save().catch(err => console.log(err))
        }
    }).then(function () {
        commands.forEach((element, cmdIndex) => {
            db.findOne({
                guildID: guild.id,
                commands: { $elemMatch: { name: commands[cmdIndex] } }
            }, (err, exists) => {
                if (err) console.log(err)
                if (!exists) {
                    if (commands[cmdIndex] !== "help" && !commands[cmdIndex].includes("toggle")
                        && commands[cmdIndex] !== "status") {
                        db.updateOne({ guildID: guild.id }, {
                            $push: { commands: { name: commands[cmdIndex], status: false } }
                        }).catch(err => console.log(err))
                    } else {
                        db.updateOne({ guildID: guild.id }, {
                            $push: { commands: { name: commands[cmdIndex], status: true } }
                        }).catch(err => console.log(err))
                    }
                }
            })
        });
    }).catch(err => console.log(err))
}