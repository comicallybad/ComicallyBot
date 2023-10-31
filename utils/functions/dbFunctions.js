const { s, del, warn, hasPermissions } = require('./functions.js');
const mongoose = require("mongoose");
const db = require('../schemas/db.js');
const xp = require('../schemas/xp.js');
const { EmbedBuilder } = require('discord.js');
const { antiPhishing } = require('discord-antiphishinglinks')

module.exports = {
    //Setup guild in DB, if guild exists: update guild name, then call cmdSetup 
    dbSetup: async function (client) {
        const guilds = client.guilds.cache.map(guild => ({ id: guild.id, name: guild.name }));

        await Promise.all(guilds.map(async guild => {
            let exists = await db.findOne({ guildID: guild.id }).catch(err => err);
            if (!exists) {
                exists = new db({
                    _id: mongoose.Types.ObjectId(),
                    guildID: guild.id,
                    guildName: guild.name,
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
                    deleteReaction: undefined
                });
            } else {
                exists.guildName = guild.name;
            }
            await exists.save().catch(err => err);
            await module.exports.cmdSetup(client, guild.id);
        }));
    },

    cmdSetup: async function (client, guildID) {
        const commands = client.commands.map(cmd => cmd.name);
        const exists = await db.findOne({ guildID: guildID }).catch(err => err);
        if (exists) {
            exists.commands = exists.commands.filter(cmd => commands.includes(cmd.name));
            commands.forEach(cmd => {
                const existingCmd = exists.commands.find(c => c.name === cmd);
                if (!existingCmd) {
                    exists.commands.push({ name: cmd, status: true });
                } else if (exists.commands.filter(c => c.name === cmd).length > 1) {
                    exists.commands.splice(exists.commands.findIndex(c => c.name === cmd), 1);
                }
            });
            await exists.save().catch(err => err);
        }
    },

    addXP: async function (message, userID, xpToAdd) {
        const guildID = message.guild.id;
        let existsDB = await db.findOne({ guildID: guildID }).catch(err => err);
        if (!existsDB || !existsDB.xpSystem) return;

        let user = await message.guild.members.fetch(userID);
        let rankChannel = existsDB.channels.find(ch => ch.command == "rank")
            ? await message.guild.channels.fetch(existsDB.channels.find(ch => ch.command == "rank").channelID).catch(err => { return; })
            : undefined;
        if (!rankChannel) rankChannel = message.channel;
        if (!xpToAdd) xpToAdd = existsDB.xpMultiplier ? Math.floor(Math.random() * 10) + 1 * existsDB.xpMultiplier : Math.floor(Math.random() * 10) + 1;

        let exists = await xp.findOne({ guildID: guildID, userID: userID }).catch(err => err);
        if (!exists) return new xp({
            _id: mongoose.Types.ObjectId(),
            guildID: guildID, guildName: message.guild.name,
            userID: user.id, userName: user.user.username,
            userNickname: user.nickname,
            userDisplayAvatarURL: user.user.displayAvatarURL(),
            xp: xpToAdd, level: 0
        }).save().catch(err => err);

        exists.xp += xpToAdd, exists.guildName = message.guild.name;
        exists.userName = user.user.username, exists.userNickname = user.nickname;
        exists.userDisplayAvatarURL = user.user.displayAvatarURL();

        let rankupXP = 10 * Math.pow(exists.level + 1, 3) / 5 + 25 - exists.xp;

        while (rankupXP <= 0) {
            if (rankupXP <= 0) {
                exists.level++;
                module.exports.checkXPRankup(message, userID, exists.level);
            }
            rankupXP = 10 * Math.pow(exists.level + 1, 3) / 5 + 25 - exists.xp;
            if (rankupXP >= 0)
                s(rankChannel, `${user} You leveled up! You are now level: ${exists.level}`);
        }
        return exists.save().catch(err => err);
    },

    checkXPRankup: async function (message, userID, level) {
        const guildID = message.guild.id;
        let exists = await db.findOne({ guildID: guildID }).catch(err => err);
        if (!exists || !exists.xpSystem) return;

        let user = await message.guild.members.fetch(userID);
        let rankChannel = exists.channels.find(ch => ch.command == "rank")
            ? await message.guild.channels.fetch(exists.channels.find(ch => ch.command == "rank").channelID).catch(err => { return; })
            : undefined;
        if (!rankChannel) rankChannel = message.channel;
        const logChannel = message.guild.channels.cache.find(c => c.name.includes("role-logs"))
            || message.guild.channels.cache.find(c => c.name.includes("mod-logs")) || message.channel;

        const embed = new EmbedBuilder()
            .setColor("#00FF00")
            .setTitle("Member joined role via Leveling Up")
            .setThumbnail(user.user.displayAvatarURL())
            .setFooter({ text: `${user.user.tag} (${user.id})`, iconURL: user.user.displayAvatarURL() })
            .setTimestamp()

        let roles = exists.xpRoles.filter(role => role.level == level);
        return roles.forEach(role => {
            if (user.roles.cache.get(role.roleID)) return;
            embed.setDescription(`**Member:** ${user} (${user.id})\n**Role Joined: ${role.roleName}** (${role.roleID})`);
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

    checkSpam: async function (client, message) {
        let guildID = message.guild.id;
        const exists = await db.findOne({ guildID: guildID, antiSpam: true })
        let isMod = await hasPermissions(message, "moderator");
        if (!exists || isMod) return;
        else return client.antiSpam.message(message).catch(err => err);
    },

    checkAntiPhishing: async function (message) {
        const guildID = message.guild.id;
        const exists = await db.findOne({ guildID: guildID, antiPhishing: true })
        let isMod = await hasPermissions(message, "moderator");
        if (!exists || isMod) return;
        else return antiPhishing(message).then(res => {
            if (res) return warn(message, "Phishing Link", res.link);
        });
    },

    checkWarn: async function (client, message) {
        module.exports.checkSpam(client, message);
        let checkBadWords = await module.exports.checkBadWords(message).then(check => {
            if (!check) return module.exports.checkAntiPhishing(message);
        });
    }
}