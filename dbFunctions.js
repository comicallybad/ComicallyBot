const mongoose = require("mongoose");
const db = require('./schemas/db.js');
const xp = require('./schemas/xp.js');
const { del, warn, hasPermissions } = require('./functions.js');
const { MessageEmbed } = require('discord.js');

let cooldown = new Set();

module.exports = {
    dbSetup: function (client) {
        let guildsID = (client.guilds.cache.map(guild => guild.id));
        let guildsName = (client.guilds.cache.map(guild => guild.name));
        let commands = (client.commands.map(cmd => cmd.name));

        guildsID.forEach((element, guildIndex) => { //for each guild
            db.findOne({ guildID: guildsID[guildIndex] }, (err, exists) => {
                if (!exists) {
                    const newDB = new db({
                        _id: mongoose.Types.ObjectId(),
                        guildID: guildsID[guildIndex],
                        guildName: guildsName[guildIndex],
                        commands: [],
                        xpSystem: false,
                        xpRoles: [],
                        reactionRoles: [],
                        reactionCommands: [],
                        profanityFilter: false,
                        antiSpam: false,
                        badWordList: [],
                        xpMultiplier: 1,
                    })
                    newDB.save().catch(err => console.log(err));
                } else {
                    exists.guildName = guildsName[guildIndex]; //in case name changed
                    exists.save().catch(err => console.log(err));
                }
            }).then(function () {
                commands.forEach((element, cmdIndex) => {
                    db.findOne({
                        guildID: guildsID[guildIndex],
                        commands: { $elemMatch: { name: commands[cmdIndex] } }
                    }, (err, exists) => {
                        if (!exists) {
                            db.updateOne({ guildID: guildsID[guildIndex] }, {
                                $push: { commands: { name: commands[cmdIndex], status: true } }
                            }).catch(err => console.log(err));
                        }
                    })
                });
            }).catch(err => console.log(err));
        });
    },

    messageXP: function (message, client) {
        let guildID = message.guild.id;

        db.findOne({ guildID: guildID }, async (err, exists) => {
            if (!exists) return module.exports.dbSetup(client);
            if (exists.xpSystem) {
                let guildName = message.guild.name;
                let userID = message.member.id;
                let userName = message.author.username;
                let xpToAdd = Math.floor(Math.random() * 10) + 1;
                let rankChannel = message.channel;
                let user = await message.guild.members.fetch(userID);

                db.findOne({ guildID: guildID }, (err, exists) => {
                    if (exists) {
                        if (exists.xpMultiplier)
                            xpToAdd = xpToAdd * exists.xpMultiplier;
                        db.findOne({ guildID: guildID, channels: { $elemMatch: { command: "rank" } } }, (err, exists) => {
                            if (exists)
                                rankChannel = client.channels.cache.get(exists.channels[exists.channels.map(cmd => cmd.command).indexOf("rank")].channelID);
                        }).catch(err => console.log(err))
                    } else {
                        exists.xpMultiplier = 1;
                        exists.save().catch(err => console.log(err));
                    }
                }).catch(err => console.log(err)).then(function () {
                    xp.findOne({ guildID: guildID, userID: userID }, (err, exists) => {
                        if (!exists) {
                            const newXP = new xp({
                                _id: mongoose.Types.ObjectId(),
                                guildID: guildID, guildName: guildName,
                                userID: userID, userName: userName, xp: xpToAdd, level: 0
                            })
                            newXP.save().catch(err => console.log(err));
                        } else {
                            exists.xp += xpToAdd;
                            exists.guildName = guildName;
                            exists.userName = userName;
                            let rankupXP = 10 * Math.pow(exists.level + 1, 3) / 5 + 25 - exists.xp;

                            while (rankupXP <= 0) {
                                if (rankupXP <= 0) {
                                    exists.level++;
                                    module.exports.checkXPRankup(message, userID, exists.level);
                                }
                                rankupXP = rankupXP = 10 * Math.pow(exists.level + 1, 3) / 5 + 25 - exists.xp;
                                if (rankupXP >= 0)
                                    rankChannel.send(`${user} You leveled up! You are now level: ${exists.level}`).catch(err => err);
                            }
                            exists.save().catch(err => console.log(err));
                        }
                    }).catch(err => console.log(err));
                });
            }
        }).catch(err => console.log(err));
    },

    addXP: async function (message, userID, xpToAdd) {
        let guildID = message.guild.id;
        let guildName = message.guild.name;
        let userNames = message.guild.members.cache.map(user => user.user.username);
        let userIDs = message.guild.members.cache.map(user => user.user.id);
        let userName = userNames[userIDs.indexOf(userID)];
        let rankChannel = message.channel;
        let user = await message.guild.members.fetch(userID);

        db.findOne({ guildID: guildID, channels: { $elemMatch: { command: "rank" } } }, (err, exists) => {
            if (exists)
                rankChannel = message.guild.channels.cache.get(exists.channels[exists.channels.map(cmd => cmd.command).indexOf("rank")].channelID);
        }).catch(err => console.log(err));

        xp.findOne({ guildID: guildID, userID: userID }, async (err, exists) => {
            if (!exists) {
                const newXP = new xp({
                    _id: mongoose.Types.ObjectId(),
                    guildID: guildID, guildName: guildName,
                    userID: userID, userName: userName, xp: xpToAdd, level: 0
                })
                newXP.save().catch(err => console.log(err));
            } else {
                exists.xp += xpToAdd;
                let rankupXP = 10 * Math.pow(exists.level + 1, 3) / 5 + 25 - exists.xp;

                while (rankupXP <= 0) {
                    if (rankupXP <= 0) {
                        exists.level++;
                        await module.exports.checkXPRankup(message, userID, exists.level);
                    }
                    rankupXP = rankupXP = 10 * Math.pow(exists.level + 1, 3) / 5 + 25 - exists.xp;
                    if (rankupXP >= 0) rankChannel.send(`${user} You leveled up! You are now level: ${exists.level}`).catch(err => err);
                }
                exists.save().catch(err => console.log(err));
            }
        }).catch(err => console.log(err));
    },

    checkXPRankup: async function (message, userID, level) {
        const logChannel = message.guild.channels.cache.find(c => c.name === "mod-logs") || message.channel;
        let guildID = message.guild.id;
        let user = await message.guild.members.fetch(userID);
        const embed = new MessageEmbed()
            .setColor("#0efefe")
            .setTitle("User joined role via Leveling Up")
            .setThumbnail(user.user.displayAvatarURL())
            .setFooter(user.id, user.user.displayAvatarURL())
            .setTimestamp()

        let exists = await db.findOne({ guildID: guildID, xpRoles: { $elemMatch: { level: level } } });
        if (exists) {
            roles = exists.xpRoles.filter(role => role.level == level);
            roles.forEach(role => {
                if (!user.roles.cache.get(role.roleID)) {
                    embed.setDescription(`${user} ${user.user.tag} joined the **${role.roleName}**(${role.roleID})`);
                    if (logChannel) logChannel.send(embed);
                    user.roles.add(role.roleID).then(() => {
                        return user.send(`Hello, you have been given the **${role.roleName}** role in ${message.guild.name} for: **Ranking up to level ${level}!**`).catch(err => err);
                    }).catch(err => {
                        if (err) return message.reply(`There was an error assigning XP level role. ${err}`).then(m => del(m, 7500));
                    });
                }
            });
            return;
        } else return;
    },

    checkBadWords: async function (message) {
        let guildID = message.guild.id;
        let words = message.content.replace(/ /g, '').toLowerCase();

        db.findOne({ guildID: guildID }, async (err, exists) => {
            if (!exists) return;
            if (exists.profanityFilter) {
                if (exists.badWordList) {
                    let isMod = await hasPermissions(message, "moderator");
                    if (isMod) return;
                    else {
                        let badWordList = exists.badWordList;
                        let bool = badWordList.filter(word => words.includes(word.toLowerCase()));
                        if (bool.length > 0) {
                            del(message, 0);
                            return warn(message, profanityUsers, "profanity");
                        } else return;
                    }
                }
            }
        });
    },

    checkSpam: function (message) {
        let guildID = message.guild.id;
        db.findOne({ guildID: guildID }, async (err, exists) => {
            if (!exists) return;
            if (exists.antiSpam) {
                let isMod = await hasPermissions(message, "moderator");
                if (isMod) return;
                else {
                    if (spamUsers.some(user => user.id === message.author.id)) {
                        spamUsers.find(user => user.id === message.author.id).offences += 1;
                    } else {
                        spamUsers.push({ id: message.author.id, offences: 1 })
                    }

                    cooldown.add(message.author.id);

                    setTimeout(() => {
                        cooldown.delete(message.author.id);
                    }, 2500);

                    setTimeout(() => {
                        if (spamUsers.find(user => user.id === message.author.id))
                            spamUsers.splice(spamUsers.findIndex(user => user.id === message.author.id), 1);
                    }, 5000);

                    if (cooldown.has(message.author.id) && spamUsers.find(user => user.id === message.author.id).offences >= 5) {
                        warn(message, spamOffencers, "spam");
                    }
                }
            }
        }).catch(err => console.log(err));
    },
}