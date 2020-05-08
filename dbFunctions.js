const mongoose = require("mongoose")
const db = require('./schemas/db.js');
const xp = require('./schemas/xp.js');
const { del } = require("./functions.js")

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
                        xpMultiplier: 1
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

    messageXP(message, client) {
        let guildName = message.guild.name;
        let guildID = message.guild.id;
        let userID = message.member.id;
        let userName = message.author.username;
        let xpAdd = Math.floor(Math.random() * 10) + 1;
        let logChannel = message.channel;

        db.findOne({ guildID: guildID }, (err, exists) => {
            if (!exists) module.exports.dbSetup(client)
            if (exists) {
                if (exists.xpMultiplier)
                    xpAdd = xpAdd * exists.xpMultiplier;
                db.findOne({ guildID: guildID, channels: { $elemMatch: { command: "rank" } } }, (err, exists) => {
                    if (err) console.log(err)
                    if (exists)
                        logChannel = client.channels.cache.get(exists.channels[exists.channels.map(cmd => cmd.command).indexOf("rank")].channelID);
                }).catch(err => console.log(err))
            } else {
                exists.xpMultiplier = 1
                exists.save().catch(err => console.log(err));
            }
        }).catch(err => console.log(err)).then(function () {
            xp.findOne({ guildID: guildID, userID: userID }, (err, exists) => {
                if (err) console.log(err)
                if (!exists) {
                    const newXP = new xp({
                        _id: mongoose.Types.ObjectId(),
                        guildID: guildID, guildName: guildName,
                        userID: userID, userName: userName, xp: xpAdd, level: 0
                    })
                    newXP.save().catch(err => console.log(err));
                } else {
                    exists.guildName = guildName;
                    exists.userName = userName;
                    const currentXP = exists.xp + xpAdd;
                    let currentLevel = exists.level;
                    let nextLevelXP = Number;
                    if (currentLevel == 0) nextLevelXP = 10;
                    else if (currentLevel == 1) nextLevelXP = 50;
                    else nextLevelXP = 50 + Math.pow(10, currentLevel);

                    if (nextLevelXP <= currentXP) {
                        currentLevel++;
                        module.exports.checkXPRankup(message, userID, currentLevel)
                        logChannel.send(`${message.author} You leveled up! You are now level: ${currentLevel}`);
                    }

                    exists.xp = currentXP;
                    exists.level = currentLevel;

                    exists.save().catch(err => console.log(err))
                }
            })
        })
    },
    async addXP(message, userID, xpToAdd) {
        let guildID = message.guild.id;
        let userNames = message.guild.members.cache.map(user => user.user.username);
        let userIDs = message.guild.members.cache.map(user => user.user.id);
        let userName = userNames[userIDs.indexOf(userID)];
        let rankChannel = message.channel;
        let user = await message.guild.members.fetch(userID)

        db.findOne({ guildID: guildID, channels: { $elemMatch: { command: "rank" } } }, (err, exists) => {
            if (err) console.log(err)
            if (exists)
                rankChannel = message.guild.channels.cache.get(exists.channels[exists.channels.map(cmd => cmd.command).indexOf("rank")].channelID);
        }).catch(err => console.log(err))

        xp.findOne({ guildID: guildID, userID: userID }, (err, exists) => {
            if (!exists) {
                const newXP = new xp({
                    _id: mongoose.Types.ObjectId(),
                    guildID: guildID, guildName: guildName,
                    userID: userID, userName: userName, xp: xpToAdd
                })
                newXP.save().catch(err => console.log(err));
            } else {
                exists.xp += xpToAdd
                let rankupXP = Number;

                if (exists.level == 0) rankupXP = 10 - exists.xp;
                else if (exists.level == 1) rankupXP = 50 - exists.xp;
                else rankupXP = 50 + Math.pow(10, exists.level) - exists.xp;

                while (rankupXP < 0) {
                    exists.username = userName;
                    if (exists.level == 0) rankupXP = 10 - exists.xp;
                    else if (exists.level == 1) rankupXP = 50 - exists.xp;
                    else rankupXP = 50 + Math.pow(10, exists.level) - exists.xp;
                    exists.level++;
                    module.exports.checkXPRankup(message, userID, exists.level)
                    rankChannel.send(`${user}You leveled up! You are now level: ${exists.level}`).catch(err => err);
                }
                exists.save().catch(err => console.log(err));
            }
        }).catch(err => console.log(err));
    },

    async checkXPRankup(message, userID, level) {
        let guildID = message.guild.id;
        let user = await message.guild.members.fetch(userID)

        db.findOne({ guildID: guildID, xpRoles: { $elemMatch: { level: level } } }, (err, exists) => {
            if (err) console.log(err)
            if (exists) {
                roles = exists.xpRoles.filter(role => role.level == level)
                roles.forEach(role => {
                    user.roles.add(role.roleID).then(() => {
                        user.send(`Hello, you have been given the **${role.roleName}** role in ${message.guild.name} for: **Ranking up to level ${level}!**`).catch(err => err);
                    }).catch(err => {
                        if (err) return message.reply(`There was an error assigning XP level role. ${err}`).then(m => del(m, 7500));
                    });
                });
            } else return;
        })
    }
}