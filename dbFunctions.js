const mongoose = require("mongoose")
const db = require('./schemas/db.js');
const coins = require('./schemas/coins.js');

module.exports = {
    dbSetup(client) {
        let guildsID = (client.guilds.cache.map(guild => guild.id));
        let guildsName = (client.guilds.cache.map(guild => guild.name));
        let commands = (client.commands.map(cmd => cmd.name));

        guildsID.forEach((element, guildIndex) => { //for each guild
            db.findOne({ guildID: guildsID[guildIndex] }, (err, exists) => {
                if (err) console.log(err)
                if (!exists) {
                    const newDB = new db({
                        _id: mongoose.Types.ObjectId(),
                        guildID: guildsID[guildIndex],
                        guildName: guildsName[guildIndex],
                        commands: [],
                        coinsMultiplier: 1
                    })
                    newDB.save().catch(err => console.log(err))
                } else {
                    exists.guildName = guildsName[guildIndex]; //in case name changed
                    exists.save().catch(err => console.log(err))
                }
            }).then(function () {
                commands.forEach((element, cmdIndex) => {
                    db.findOne({
                        guildID: guildsID[guildIndex],
                        commands: { $elemMatch: { name: commands[cmdIndex] } }
                    }, (err, exists) => {
                        if (err) console.log(err)
                        if (!exists) {
                            db.updateOne({ guildID: guildsID[guildIndex] }, {
                                $push: { commands: { name: commands[cmdIndex], status: true } }
                            }).catch(err => console.log(err))
                        }
                    })
                });
            }).catch(err => console.log(err))
        });
    },

    addCoins(message, client) {
        let guildName = message.guild.name;
        let guildID = message.guild.id;
        let userID = message.member.id;
        let userName = message.author.username;
        let coinsToAdd = Math.floor(Math.random() * 25) + 1;

        db.findOne({ guildID: guildID }, (err, exists) => {
            if (!exists) module.exports.dbSetup(client)
            if (exists)
                if (exists.coinsMultiplier)
                    coinsToAdd = coinsToAdd * exists.coinsMultiplier;
                else {
                    exists.coinsMultiplier = 1
                    exists.save().catch(err => console.log(err));
                }
        }).catch(err => console.log(err)).then(function () {
            coins.findOne({ guildID: guildID, userID: userID }, (err, exists) => {
                if (err) console.log(err)
                if (!exists) {
                    const newCoins = new coins({
                        _id: mongoose.Types.ObjectId(),
                        guildID: guildID, guildName: guildName,
                        userID: userID, userName: userName, coins: coinsToAdd
                    })
                    newCoins.save().catch(err => console.log(err));
                } else {
                    exists.guildName = guildName;
                    exists.userName = userName;
                    exists.coins = exists.coins + coinsToAdd;
                    exists.save().catch(err => console.log(err))
                }
            })
        })
    },
}