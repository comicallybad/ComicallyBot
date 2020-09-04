const mongoose = require("mongoose");
const db = require("./schemas/db.js");
const xp = require("./schemas/xp.js");
const { del, warn, hasPermissions } = require("./functions.js");
const { MessageEmbed } = require("discord.js");

let cooldown = new Set();
module.exports = {
    dbSetup(client) {
        let guildsID = (client.guilds.cache.map(guild => guild.id));
        let guildsName = (client.guilds.cache.map(guild => guild.name));
        let commands = (client.commands.map(cmd => cmd.name));

        guildsID.forEach((element, guildIndex) => { //for each guild
            db.findOne({ guildID: guildsID[guildIndex] }, (err, exists) => {
                if (err) console.log(err);
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
                    });
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
                        if (err) console.log(err);
                        if (!exists) {
                            db.updateOne({ guildID: guildsID[guildIndex] }, {
                                $push: { commands: { name: commands[cmdIndex], status: true } }
                            }).catch(err => console.log(err));
                        }
                    });
                });
            }).catch(err => console.log(err));
        });
    },

    messageXP(message, client) {
        let guildID = message.guild.id;

        db.findOne({ guildID }, async (err, exists) => {
            if (!exists) module.exports.dbSetup(client);
            if (exists.xpSystem) {
                const guildName = message.guild.name;
                const userID = message.member.id;
                const userName = message.author.username;
                const user = await message.guild.members.fetch(userID);

                let xpToAdd = Math.floor(Math.random() * 10) + 1;
                let rankChannel = message.channel;
                db.findOne({ guildID }, (err, exists) => {
                    if (!exists) module.exports.dbSetup(client);
                    if (exists) {
                        if (exists.xpMultiplier)
                            xpToAdd = xpToAdd * exists.xpMultiplier;
                        db.findOne({
                            guildID,
                            channels: { $elemMatch: { command: "rank" } }
                        }, (err, exists) => {
                            if (err) console.log(err);
                            if (exists) {
                                const i = exists.channels.map(cmd => cmd.command).indexOf("rank");
                                rankChannel = client.channels.cache.get(exists.channels[i].channelID);
                            }
                        }).catch(err => console.log(err));
                    } else {
                        exists.xpMultiplier = 1;
                        exists.save().catch(err => console.log(err));
                    }
                }).catch(err => console.log(err)).then(function () {
                    xp.findOne({ guildID, userID: userID }, (err, exists) => {
                        if (err) console.log(err);
                        if (!exists) {
                            const newXP = new xp({
                                _id: mongoose.Types.ObjectId(),
                                guildID, guildName: guildName,
                                userID: userID, userName: userName, xp: xpToAdd, level: 0
                            });
                            newXP.save().catch(err => console.log(err));
                        } else {
                            exists.xp += xpToAdd;
                            exists.guildName = guildName;
                            exists.userName = userName;
                            this.runRankUps(exists, message, userID, rankChannel, user);
                            exists.save().catch(err => console.log(err));
                        }
                    }).catch(err => console.log(err));
                });
            }
        }).catch(err => console.log(err));
    },

    async addXP(message, userID, xpToAdd) {
        const guildID = message.guild.id;
        const guildName = message.guild.name;
        const userNames = message.guild.members.cache.map(user => user.user.username);
        const userIDs = message.guild.members.cache.map(user => user.user.id);
        const userName = userNames[userIDs.indexOf(userID)];
        const user = await message.guild.members.fetch(userID);

        let rankChannel = message.channel;
        await db.findOne({ guildID, channels: { $elemMatch: { command: "rank" } } }, (err, exists) => {
                if (err) console.log(err);
                if (exists) {
                    const i = exists.channels.map(cmd => cmd.command).indexOf("rank");
                    rankChannel = message.guild.channels.cache.get(exists.channels[i].channelID);
                }
            })
            .catch(err => console.log(err));

        await xp.findOne({ guildID, userID: userID }, (err, exists) => {
            if (!exists) {
                const newXP = new xp({
                    _id: mongoose.Types.ObjectId(),
                    guildID, guildName: guildName,
                    userID: userID, userName: userName, xp: xpToAdd, level: 0
                });

                newXP.save().then((exists) => {
                    this.runRankUps(exists, message, userID, rankChannel, user);
                    exists.save().catch(err => console.log(err));
                }).catch(err => console.log(err));
            } else {
                exists.xp += xpToAdd;
                this.runRankUps(exists, message, userID, rankChannel, user);
                exists.save().catch(err => console.log(err));
            }
        }).catch(err => console.log(err));
    },

    async runRankUps(doc, message, userID, rankChannel, user) {
        let rankupXP = 0;

        if (doc.level === 0) rankupXP = 10 - doc.xp;
        else rankupXP = 10 * Math.pow(doc.level + 1, 3) / 5 - doc.xp;

        while (rankupXP <= 0) {
            if (rankupXP <= 0) {
                doc.level++;
                await module.exports.checkXPRankup(message, userID, doc.level);
            }

            if (doc.level === 0) rankupXP = 10 - doc.xp;
            else rankupXP = (10 * Math.pow(doc.level + 1, 3) / 5) - doc.xp;
            if (rankupXP >= 0) rankChannel.send(`${user} You leveled up! You are now level: ${doc.level}`).catch(err => err);
        }
    },

    async checkXPRankup(message, userID, level) {
        const logChannel = message.guild.channels.cache.find(c => c.name === "mod-logs") || message.channel;

        let guildID = message.guild.id;
        let user = await message.guild.members.fetch(userID);
        const embed = new MessageEmbed()
            .setColor("#0efefe")
            .setTitle("User joined role via Leveling Up")
            .setThumbnail(user.user.displayAvatarURL())
            .setFooter(user.id, user.user.displayAvatarURL())
            .setTimestamp();

        db.findOne({ guildID, xpRoles: { $elemMatch: { level: level } } }, (err, exists) => {
            if (err) console.log(err);
            if (exists) {
                const roles = exists.xpRoles.filter(role => role.level === level);
                roles.forEach(role => {
                    if (!message.member.roles.cache.get(role.roleID)) {
                        embed.setDescription(`${user} ${user.user.tag} joined the **${role.roleName}**(${role.roleID})`);
                        if (logChannel) logChannel.send(embed);
                        user.roles.add(role.roleID).then(() => {
                            user.send(`Hello, you have been given the **${role.roleName}** role in ${message.guild.name} for: **Ranking up to level ${level}!**`).catch(err => err);
                        }).catch(err => {
                            if (err) return message.reply(`There was an error assigning XP level role. ${err}`).then(m => del(m, 7500));
                        });
                    }
                });
            }
        });
    },

    async checkBadWords(message) {
        let guildID = message.guild.id;
        let words = message.content.replace(/ /g, "").toLowerCase();

        db.findOne({ guildID }, async (err, exists) => {
            if (err) console.log(err);
            if (exists.profanityFilter) {
                if (exists.badWordList) {
                    let isMod = await hasPermissions(message, "moderator");
                    if (isMod) return;

                    let badWordList = exists.badWordList;
                    let swears = badWordList.filter(word => words.includes(word.toLowerCase()));
                    if (swears.length > 0) {
                        await del(message, 0);
                        return warn(message, profanityUsers, "profanity");
                    }
                }
            }
        });
    },

    checkSpam(message) {
        let guildID = message.guild.id;
        db.findOne({ guildID }, async (err, exists) => {
            if (err) console.log(err);
            if (exists.antiSpam) {
                let isMod = await hasPermissions(message, "moderator");
                if (isMod) return;

                spamUsers.some(u => u.id === message.author.id)
                    ? ++spamUsers.find(u => u.id === message.author.id).offenses
                    : spamUsers.push({ id: message.author.id, offenses: 1 });

                cooldown.add(message.author.id);
                setTimeout(() => cooldown.delete(message.author.id), 2500);
                setTimeout(() => {
                    if (spamUsers.find(user => user.id === message.author.id))
                        spamUsers.splice(spamUsers.findIndex(user => user.id === message.author.id), 1);
                }, 5000);

                if (cooldown.has(message.author.id) && spamUsers.find(user => user.id === message.author.id).offences >= 5) {
                    await warn(message, spamOffencers, "spam");
                }
            }
        });
    },
};