const { PermissionFlagsBits } = require('discord.js');
const { del, warn } = require('./functions.js');
const mongoose = require("mongoose");
const db = require('../schemas/db.js');
const { antiPhishing } = require('discord-antiphishinglinks');

module.exports = {
    dbSetup: async function (client) {
        const guilds = client.guilds.cache.map(guild => ({ id: guild.id, name: guild.name }));

        await Promise.all(guilds.map(async guild => {
            let exists = await db.findOne({ guildID: guild.id }).catch(err => err);
            if (!exists) {
                exists = new db({
                    _id: new mongoose.Types.ObjectId(),
                    guildID: guild.id,
                    guildName: guild.name,
                    profanityFilter: false,
                    antiSpam: false,
                    antiPhishing: false,
                });
            } else {
                exists.guildName = guild.name;
            }
            await exists.save().catch(err => err);
        }));
    },

    checkBadWords: async function (message) {
        const guildID = message.guild.id;
        const words = message.content.replace(/ /g, '').toLowerCase();
        const check = await db.findOne({ guildID: guildID, profanityFilter: true }).catch(err => err);
        const isMod = message.member.permissions.has(PermissionFlagsBits.ManageMessages);

        if (!check || !check.badWordList || isMod) return;

        const badWordList = check.badWordList;
        const bool = badWordList.filter(word => words.includes(word.toLowerCase()));

        if (bool.length > 0) {
            del(message, 0);
            warn(message, "Banned Word/Phrase");
            return true;
        } else return;
    },

    checkAntiPhishing: async function (message) {
        const guildID = message.guild.id;
        const exists = await db.findOne({ guildID: guildID, antiPhishing: true })
        const isMod = message.member.permissions.has(PermissionFlagsBits.ManageMessages);

        if (!exists || isMod) return;
        else return antiPhishing(message).then(res => {
            if (res) return warn(message, "Phishing Link", res.link);
        });
    },

    checkWarn: async function (client, message) {
        const checkBadWords = await module.exports.checkBadWords(message).then(check => {
            if (!check) return module.exports.checkAntiPhishing(message);
        });
    }
}