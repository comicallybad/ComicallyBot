const { s, r, del, warn, hasPermissions } = require('./functions.js');
const mongoose = require("mongoose");
const db = require('./schemas/db.js');
const xp = require('./schemas/xp.js');
const { MessageEmbed } = require('discord.js');
const { antiPhishing } = require('discord-antiphishinglinks')

module.exports = {
    dbSetup: async function (client) {
        let guildsID = await client.guilds.cache.map(guild => guild.id);
        let guildsName = await client.guilds.cache.map(guild => guild.name);
        let commands = await client.commands.map(cmd => cmd.name);

        guildsID.forEach((element, guildIndex) => { //for each guild
            db.findOne({ guildID: guildsID[guildIndex] }, (err, exists) => {
                if (!exists) {
                    const newDB = new db({
                        _id: mongoose.Types.ObjectId(),
                        guildID: guildsID[guildIndex],
                        guildName: guildsName[guildIndex],
                        memberRoles: [],
                        modRoles: [],
                        verificationRole: [],
                        commands: [],
                        channels: [],
                        xpRoles: [],
                        xpMultiplier: 1,
                        xpSystem: false,
                        profanityFilter: false,
                        antiSpam: false,
                        antiPhishing: false,
                        reactionRoles: [],
                        badWordList: [],
                        welcomeMessage: [],
                        welcomeMessageReactions: [],
                    })
                    newDB.save().catch(err => err);
                } else {
                    //in case name changed
                    exists.guildName = guildsName[guildIndex];
                    exists.save().catch(err => err);
                }
            }).catch(err => err).then(() => {
                db.findOne({
                    guildID: guildsID[guildIndex],
                }, (err, exists) => {
                    if (!exists) return;
                    exists.commands.forEach((cmd, index) => {
                        //in case a command is deleted, delete the command from db
                        if (!commands.includes(cmd.name)) exists.commands.splice(index, 1);
                    });
                    commands.forEach(cmd => {
                        //in case a command was added, add the command to db
                        if (!exists.commands.find(c => c.name == cmd)) exists.commands.push({ name: cmd, status: true });
                        //in case if duplicate command in db, delete the commands first occurance
                        else if (exists.commands.map(c => c.name == cmd) > 1) exists.commands.splice(indexOf(exists.commands.map(c => c.name == cmd), 1));
                    });
                    exists.save().catch(err => err);
                }).catch(err => err);
            });
        });
    },

    messageXP: function (message, client) {
        let guildID = message.guild.id;

        db.findOne({ guildID: guildID }, async (err, exists) => {
            if (!exists) return module.exports.dbSetup(client);
            if (exists.xpSystem) {
                let guildName = message.guild.name;
                let userID = message.member.id;
                let userName = message.member.user.username;
                let userNickname = message.member.nickname;
                let userDisplayAvatarURL = message.member.user.displayAvatarURL()
                let xpToAdd = Math.floor(Math.random() * 10) + 1;
                let rankChannel = message.channel;
                let user = await message.guild.members.fetch(userID);

                db.findOne({ guildID: guildID }, (err, exists) => {
                    if (exists) {
                        if (exists.xpMultiplier) xpToAdd = xpToAdd * exists.xpMultiplier;
                        db.findOne({ guildID: guildID, channels: { $elemMatch: { command: "rank" } } }, (err, exists) => {
                            if (exists) return rankChannel = client.channels.cache.get(exists
                                .channels[exists.channels.map(cmd => cmd.command).indexOf("rank")].channelID);
                        }).catch(err => err)
                    } else {
                        exists.xpMultiplier = 1;
                        exists.save().catch(err => err);
                    }
                }).catch(err => err).then(() => {
                    xp.findOne({ guildID: guildID, userID: userID }, (err, exists) => {
                        if (!exists) {
                            const newXP = new xp({
                                _id: mongoose.Types.ObjectId(),
                                guildID: guildID, guildName: guildName,
                                userID: userID, userName: userName,
                                userNickname: userNickname, userDisplayAvatarURL: userDisplayAvatarURL,
                                xp: xpToAdd, level: 0
                            });
                            newXP.save().catch(err => err);
                        } else {
                            exists.xp += xpToAdd, exists.guildName = guildName;
                            exists.userName = userName, exists.userNickname = userNickname;
                            exists.userDisplayAvatarURL = userDisplayAvatarURL;
                            let rankupXP = 10 * Math.pow(exists.level + 1, 3) / 5 + 25 - exists.xp;

                            while (rankupXP <= 0) {
                                if (rankupXP <= 0) {
                                    exists.level++;
                                    module.exports.checkXPRankup(message, userID, exists.level);
                                }
                                rankupXP = rankupXP = 10 * Math.pow(exists.level + 1, 3) / 5 + 25 - exists.xp;
                                if (rankupXP >= 0 && rankChannel)
                                    s(rankChannel, `${user} You leveled up! You are now level: ${exists.level}`);
                            }
                            exists.save().catch(err => err);
                        }
                    }).catch(err => err);
                });
            }
        }).catch(err => err);
    },

    addXP: async function (message, userID, xpToAdd) {
        const guildID = message.guild.id;
        const guildName = message.guild.name;
        const userNames = message.guild.members.cache.map(user => user.user.username);
        const userIDs = message.guild.members.cache.map(user => user.user.id);
        const userName = userNames[userIDs.indexOf(userID)];
        const user = await message.guild.members.fetch(userID);

        let rankChannelCheck = await db.findOne({ guildID: guildID, channels: { $elemMatch: { command: "rank" } } }).catch(err => err);
        let rankChannel = message.guild.channels.cache.get(rankChannelCheck.channels[rankChannelCheck.channels.map(cmd => cmd.command).indexOf("rank")].channelID) || message.channel;

        let exists = await xp.findOne({ guildID: guildID, userID: userID });
        if (!exists) {
            const newXP = new xp({
                _id: mongoose.Types.ObjectId(),
                guildID: guildID, guildName: guildName,
                userID: userID, userName: userName, xp: xpToAdd, level: 0
            });
            return newXP.save().catch(err => err);
        }
        exists.xp += xpToAdd;
        exists.save();

        let rankupXP = 10 * Math.pow(exists.level + 1, 3) / 5 + 25 - exists.xp;

        while (rankupXP <= 0) {
            if (rankupXP <= 0) {
                exists.level++;
                module.exports.checkXPRankup(message, userID, exists.level);
            }
            rankupXP = rankupXP = 10 * Math.pow(exists.level + 1, 3) / 5 + 25 - exists.xp;
            if (rankupXP >= 0 && rankChannel)
                return s(rankChannel, `${user} You leveled up! You are now level: ${exists.level}`);
        }
    },

    checkXPRankup: async function (message, userID, level) {
        const logChannel = message.guild.channels.cache.find(c => c.name.includes("mod-logs")) || message.channel;
        const guildID = message.guild.id;
        let user = await message.guild.members.fetch(userID);

        const embed = new MessageEmbed()
            .setColor("#00FF00")
            .setTitle("Member joined role via Leveling Up")
            .setThumbnail(user.user.displayAvatarURL())
            .setFooter({ text: user.id, iconURL: user.user.displayAvatarURL() })
            .setTimestamp()

        let rankChannelCheck = await db.findOne({ guildID: guildID, channels: { $elemMatch: { command: "rank" } } }).catch(err => err);
        let rankChannel = message.guild.channels.cache.get(rankChannelCheck.channels[rankChannelCheck.channels.map(cmd => cmd.command).indexOf("rank")].channelID) || message.channel;

        let exists = await db.findOne({ guildID: guildID, xpRoles: { $elemMatch: { level: level } } }).catch(err => err);
        if (!exists) return;
        let roles = exists.xpRoles.filter(role => role.level == level);
        return roles.forEach(role => {
            if (user.roles.cache.get(role.roleID)) return;
            embed.setDescription(`${user} ${user.user.tag} joined the **${role.roleName}**(${role.roleID})`);
            if (logChannel) s(logChannel, '', embed);
            user.roles.add(role.roleID).then(() => {
                return s(rankChannel, `${user} has been given the **${role.roleName}** role for: **Ranking up to level ${level}!**`);
            }).catch(err => { return s(message.channel, `There was an error assigning XP level role. ${err}`).then(m => del(m, 7500)); });
        });
    },

    checkBadWords: async function (message) {
        let guildID = message.guild.id;
        let words = message.content.replace(/ /g, '').toLowerCase();

        let check = await db.findOne({ guildID: guildID, profanityFilter: true }).catch(err => err);
        let isMod = await hasPermissions(message, "moderator");
        if (!check || !check.badWordList || isMod) return;
        const badWordList = check.badWordList;
        const bool = badWordList.filter(word => words.includes(word.toLowerCase()));
        if (bool.length > 0) {
            del(message, 0);
            warn(message, "Banned Word/Phrase");
            return true;
        } else return;
    },

    checkSpam: function (client, message) {
        let guildID = message.guild.id;
        db.findOne({ guildID: guildID, antiSpam: true }, async (err, exists) => {
            let isMod = await hasPermissions(message, "moderator");
            if (!exists || isMod) return;
            else return client.antiSpam.message(message).catch(err => err);
        }).catch(err => err);
    },

    checkAntiPhishing: function (message) {
        const guildID = message.guild.id;
        db.findOne({ guildID: guildID, antiPhishing: true }, async (err, exists) => {
            let isMod = await hasPermissions(message, "moderator");
            if (!exists || isMod) return;
            else return antiPhishing(message).then(res => {
                if (res) return warn(message, "Phishing Link", res.link);
            });
        }).catch(err => err);
    },

    checkWarn: async function (client, message) {
        module.exports.checkSpam(client, message);
        let checkBadWords = await module.exports.checkBadWords(message).then(check => {
            if (!check) return module.exports.checkAntiPhishing(message);
        });
    }
}