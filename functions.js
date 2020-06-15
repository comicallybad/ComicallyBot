const db = require('./schemas/db.js');
const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");
let cooldown = new Set();

module.exports = {
    del: async function (message, timeout) {
        if (message) { //Fix in case bad message
            if (message.id) { //Fix cannot read ID 
                if (message.deletable) {
                    setTimeout(function () {
                        if (!message.reactions.cache.get('🛑')) {  //messages can now stop from being deleted
                            message.delete({ timeout: 0 }).catch(err => err) //This gets rid of the annoying "Unknown Message" error.
                        }
                    }, timeout);
                }
            } else return;
        } else return;
    },

    hasPermissions: async function (message, commandType) {
        let guildID = message.guild.id;
        let roleIDs = message.member.roles.cache.map(roles => roles.id);
        let userID = message.member.id;


        let hasPermissions = new Promise((resolve, reject) => {
            if (commandType == "everyone") resolve(true)
            else if (message.member.hasPermission("ADMINISTRATOR")
                || message.author.id == process.env.USERID) resolve(true)
            else {
                db.findOne({ guildID: guildID }, (err, exists) => {
                    if (err) console.log(err)
                    if (!exists) {
                    } else {
                        let modRolesIDs = exists.modRoles.map(roles => roles.roleID);
                        let memberRolesIDs = exists.memberRoles.map(roles => roles.roleID)

                        if (commandType === "moderator" && roleIDs.forEach((element) => {
                            if (modRolesIDs.includes(element) || modRolesIDs.includes(userID)) resolve(true)
                        })) {
                            roleIDs.forEach((element) => {
                                if (memberRolesIDs.includes(element)) resolve(true);
                            });
                        } else if (commandType === "member" && roleIDs.forEach((element) => {
                            if (memberRolesIDs.includes(element) || memberRolesIDs.includes(userID)
                                || modRolesIDs.includes(element) || modRolesIDs.includes(userID)) resolve(true)
                        })) {
                            roleIDs.forEach((element) => {
                                if (memberRolesIDs.includes(element)) resolve(true);
                            });
                        } else resolve(false);
                    }
                })
            }
        });

        let bool = await hasPermissions;
        return bool;
    },

    getCommandStatus: async function (message, command) {
        let guildID = message.guild.id;

        let commandStatus = new Promise((resolve, reject) => {
            db.findOne({
                guildID: guildID,
                commands: { $elemMatch: { name: command } }
            }, (err, exists) => {
                if (err) console.log(err)
                if (!exists) return message.reply("Setting up database try again momentarily...").then(m => module.exports.del(m, 7500));
                else {
                    if (exists.commands[exists.commands.map(cmd => cmd.name).indexOf(command)].status === true) resolve(true);
                    else resolve(false)
                }
            }).catch(err => console.log(err))
        });

        let status = await commandStatus;
        return status;
    },

    findID: function (message, input, type) {
        let roleIDs = message.guild.roles.cache.map(role => role.id);
        let userIDs = message.guild.members.cache.map(user => user.user.id);
        let mention = input.replace(/\D/g, '');

        if (!type || type === "either") {
            if (roleIDs.includes(input)) return input
            else if (roleIDs.includes(mention)) return mention;
            else if (userIDs.includes(input)) return input;
            else if (userIDs.includes(mention)) return mention;
            else return undefined;
        } else if (type === "user") {
            if (userIDs.includes(input)) return input;
            else if (userIDs.includes(mention)) return mention;
            else return undefined;
        } else if (type === "role") {
            if (roleIDs.includes(input)) return input
            else if (roleIDs.includes(mention)) return mention;
            else return undefined;
        }
    },

    getResponseChannel: async function (message, command) {
        let guildID = message.guild.id;

        let responseChannel = new Promise((resolve, reject) => {
            db.findOne({
                guildID: guildID,
                channels: { $elemMatch: { command: command } }
            }, (err, exists) => {
                if (err) console.log(err)
                if (!exists) return message.reply("Try setting channel first").then(m => module.exports.del(m, 7500));
                else resolve(exists.channels[exists.channels.map(cmd => cmd.command).indexOf(command)].channelID)
            }).catch(err => console.log(err))
        });

        let status = await responseChannel;
        return status;
    },

    getMember: function (message, toFind = '') {
        toFind = toFind.toLowerCase();

        let target = message.guild.members.cache.get(toFind);

        if (!target && message.mentions.members)
            target = message.mentions.members.first();

        if (!target && toFind) {
            target = message.guild.members.cache.find(member => {
                return member.displayName.toLowerCase().includes(toFind) ||
                    member.user.tag.toLowerCase().includes(toFind)
            });
        }

        if (!target)
            target = message.member;

        return target;
    },

    formatDate: function (date) {
        let year = date.getFullYear();
        let month = (1 + date.getMonth()).toString().padStart(2, '0');
        let day = date.getDate().toString().padStart(2, '0');

        return month + '/' + day + '/' + year;
    },

    //Adds certain reactions, returns first user
    promptMessage: async function (message, author, time, validReactions) {
        time *= 1000;

        for (const reaction of validReactions) await message.react(reaction);

        const filter = (reaction, user) => validReactions.includes(reaction.emoji.name) && user.id === author.id;

        return message
            .awaitReactions(filter, { max: 1, time: time })
            .then(collected => collected.first() && collected.first().emoji.name);
    },

    //Adds certain reaction, waits for certain amount of reactions, waits certain amount of time, returns all user objects
    awaitReaction: async function (message, max, time, emoji) {
        message.react(emoji);

        const filter = (reaction, user) => emoji == reaction.emoji.name && user.id !== message.author.id;

        return message
            .awaitReactions(filter, { max: max, time: time })
            .then(collected => collected.first().users.cache.map(usr => usr).filter(usr => !usr.bot))
    },

    pageList: async function (message, author, array, embed, parameter) {
        let size = 10;
        let page = 0;

        for (let i = 0; i < size && i < array.length; i++) {
            embed.addField(`${parameter} ${i + 1}`, array[i]);
        }

        message.edit(embed);

        module.exports.pageTurn(message, author, array, embed, parameter, size, page);
    },

    pageTurn: async function (message, author, array, embed, parameter, size, page) {
        let pages = Math.ceil(array.length / size) - 1; //subtract 1 because page starts at 0
        let newPage = page;
        embed.fields = [];

        for (let i = newPage * size; i < (newPage + 1) * size && i < array.length; i++) {
            embed.addField(`${parameter} ${i + 1}`, array[i]);
        }

        message.edit(embed);

        if (newPage == 0) {
            const reacted = await module.exports.promptMessage(message, author, 15, ["➡️", "🗑️"])
            if (reacted == "➡️") {
                message.reactions.removeAll().then(() => {
                    newPage++;
                    module.exports.pageTurn(message, author, array, embed, parameter, size, newPage);
                });
            } else if (reacted == "🗑️") {
                return module.exports.del(message, 0);
            } else return module.exports.del(message, 0);
        } else if (newPage !== 0 && newPage !== pages) {
            const reacted = await module.exports.promptMessage(message, author, 15, ["⬅️", "➡️", "🗑️"])
            if (reacted == "➡️") {
                message.reactions.removeAll().then(() => {
                    newPage++;
                    module.exports.pageTurn(message, author, array, embed, parameter, size, newPage);
                });
            } else if (reacted == "⬅️") {
                message.reactions.removeAll().then(() => {
                    newPage--;
                    module.exports.pageTurn(message, author, array, embed, parameter, size, newPage);
                });
            } else if (reacted == "🗑️") {
                module.exports.del(message, 0);
            } else return module.exports.del(message, 0);
        } else if (newPage == pages) {
            const reacted = await module.exports.promptMessage(message, author, 15, ["⬅️", "🗑️"])
            if (reacted == "⬅️") {
                message.reactions.removeAll().then(() => {
                    newPage--;
                    module.exports.pageTurn(message, author, array, embed, parameter, size, newPage);
                });
            } else if (reacted == "🗑️") {
                return module.exports.del(message, 0);
            } else return module.exports.del(message, 0);
        }
    },
    checkMuteRole: async function (message) {
        let muterole = message.guild.roles.cache.find(r => r.name === "Muted")
        if (!muterole) {
            try {
                muterole = await message.guild.roles.create({
                    data: { name: "Muted", color: "#778899", permissions: [] }
                })
                message.guild.channels.cache.forEach(async (channel, id) => {
                    await channel.updateOverwrite(muterole, {
                        SEND_MESSAGES: false,
                        ADD_REACTIONS: false,
                        SEND_TTS_MESSAGES: false,
                        ATTACH_FILES: false,
                        SPEAK: false,
                        CONNECT: false
                    })
                })
            } catch (e) {
                console.log(e.stack);
            }
        }
        return muterole;
    },
    checkSpam: function (message) {
        if (message.member.hasPermission("ADMINISTRATOR") ||
            message.member.hasPermission("KICK_MEMBERS") ||
            message.member.hasPermission("BAN_MEMBERS")) {
            return;
        } else {
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
                    spamUsers.splice(spamUsers.findIndex(user => user.id === message.author.id), 1)
            }, 5000)

            if (cooldown.has(message.author.id) && spamUsers.find(user => user.id === message.author.id).offences >= 3) {
                module.exports.warn(message, spamOffencers, "spam")
            }
        }
    },
    bulkDeleteCount: async function (message) {
        let messagesDeleted = await
            message.channel.messages.fetch({ limit: spamUsers.find(user => user.id === message.author.id).offences }).then(messages => {
                const spamMessages = messages.filter(msg => msg.member);
                message.channel.bulkDelete(spamMessages);
                return spamMessages.array().length;
            }).catch(err => {
                return undefined
            })
        return messagesDeleted;
    },
    warn: async function (message, userArray, type) {
        const logChannel = message.guild.channels.cache.find(c => c.name === "mod-logs") || message.channel;

        const embed = new MessageEmbed()
            .setColor("#ff0000")
            .setTitle("User Warned")
            .setThumbnail(message.guild.me.user.displayAvatarURL())
            .setFooter(message.guild.me.displayName, message.guild.me.user.displayAvatarURL())
            .setTimestamp()
            .setDescription(stripIndents`
            **Member warned for spam:** ${message.member} (${message.author.id})
            **Warned by:** ${message.guild.me}`)

        if (type === "spam") {
            let messagesDeleted = await module.exports.bulkDeleteCount(message);
            embed.addField("Messages Deleted", messagesDeleted);
        } else if (type === "profanity") embed.addField("Message Deleted", message.content);

        if (userArray.some(user => user.id === message.author.id)) {
            userArray.find(user => user.id === message.author.id).offences += 1;
            if (userArray.some(user => user.id == message.author.id && user.offences < 3)) {
                logChannel.send(embed);
                return message.reply(`You will be muted for ${type} if this continues.`).then(m => module.exports.del(m, 7500));
            } else if (userArray.some(user => user.id == message.author.id && user.offences == 3)) {
                module.exports.punish(message, userArray, type);
            } else if (userArray.some(user => user.id == message.author.id && user.offences == 4)) {
                logChannel.send(embed);
                return message.reply(`You will be muted for ${type} if this continues.`).then(m => module.exports.del(m, 7500));
            } else if (userArray.some(user => user.id == message.author.id && user.offences == 5)) {
                module.exports.punish(message, userArray, type);
            }
        } else {
            userArray.push({ id: message.author.id, offences: 1 });
            logChannel.send(embed);
            return message.reply(`Your messages were deleted for ${type}.`).then(m => module.exports.del(m, 7500));
        }
    },
    punish: async function (message, userArray, reason) {
        const logChannel = message.guild.channels.cache.find(c => c.name === "mod-logs") || message.channel;

        const embed = new MessageEmbed()
            .setColor("#ff0000")
            .setTitle("User Muted")
            .setThumbnail(message.guild.me.user.displayAvatarURL())
            .setFooter(message.guild.me.displayName, message.guild.me.user.displayAvatarURL())
            .setTimestamp()
            .setDescription(stripIndents`
            **Muted member:** ${message.member} (${message.author.id})
            **Muted by:** ${message.guild.me}
            **Reason:** ${reason}`)

        if (message.guild.me.hasPermission("MANAGE_ROLES")) {
            if (userArray.some(user => user.id == message.author.id && user.offences == 3)) {
                let muterole = await module.exports.checkMuteRole(message);
                message.member.roles.add(muterole.id).then(() => {
                    message.member.send(`Hello, you have been **muted** **for 5 minutes** in ${message.guild.name} for: **${reason}**`).catch(err => err); //in case DM's are closed
                    message.reply(`${message.member.user.username} was successfully muted **5 minutes** for **${reason}**.`).then(m => module.exports.del(m, 7500));
                    embed.addField("Mute Time: ", "5 minutes");
                    logChannel.send(embed);
                }).catch(err => {
                    if (err) return message.reply(`There was an error attempting to mute ${message.member} ${err}`).then(m => module.exports.del(m, 7500));
                }).then(setTimeout(() => {
                    message.member.roles.remove(muterole.id).then(() => {
                        message.member.send(`Hello, you have now been **unmuted** in ${message.guild.name} `).catch(err => err); //in case DM's are closed
                        message.reply(`${message.member.user.username} was successfully unmuted.`).then(m => module.exports.del(m, 7500));
                    }).catch(err => {
                        if (err) return message.reply(`There was an error attempting to unmute ${message.member} ${err}`).then(m => module.exports.del(m, 7500));
                    });
                }, 300000)); //5 Minute punishment 300000
            } else if (userArray.some(user => user.id == message.author.id && user.offences == 5)) {
                let muterole = await module.exports.checkMuteRole(message);
                message.member.roles.add(muterole.id).then(() => {
                    message.member.send(`Hello, you have been **muted** **for 10 minutes** in ${message.guild.name} for: **${reason}**`).catch(err => err); //in case DM's are closed
                    message.reply(`${message.member.user.username} was successfully muted **10 minutes** for **${reason}**.`).then(m => module.exports.del(m, 7500));
                    embed.addField("Mute Time: ", "10 minutes");
                    logChannel.send(embed);
                }).catch(err => {
                    if (err) return message.reply(`There was an error attempting to mute ${message.member} ${err}`).then(m => module.exports.del(m, 7500));
                }).then(setTimeout(() => {
                    userArray.splice(userArray.findIndex(user => user.id === message.author.id), 1)
                    message.member.roles.remove(muterole.id).then(() => {
                        message.member.send(`Hello, you have now been **unmuted** in ${message.guild.name} `).catch(err => err); //in case DM's are closed
                        message.reply(`${message.member.user.username} was successfully unmuted.`).then(m => module.exports.del(m, 7500));
                    }).catch(err => {
                        if (err) return message.reply(`There was an error attempting to unmute ${message.member} ${err}`).then(m => module.exports.del(m, 7500));
                    });
                }, 600000)); //5 Minute punishment 600000
            }
        }
    }
}