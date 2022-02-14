const db = require('./schemas/db.js');
const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");

module.exports = {
    del: function (message, timeout) {    //New global delete function due to discord.js changing it too much
        if (message) { //Fix in case bad message
            if (message.id) { //Fix cannot read ID 
                setTimeout(() => {
                    if (message.deletable && !message.reactions.cache.get('🛑'))    //messages can now stop from being deleted
                        message.delete().catch(err => err);     //This gets rid of the annoying "Unknown Message" error.
                    else message.reactions.removeAll().catch(err => err);    //This gets rid of the annoying "Unknown Message" error.
                }, timeout);
            } else return;
        } else return;
    },

    s: function (channel, content, embeds) {  //New global send function due to discord.js changing it too much
        if (!channel || !channel.guild.me.permissionsIn(channel).has("VIEW_CHANNEL") || !channel.guild.me.permissionsIn(channel).has("SEND_MESSAGES")) return;
        else if (!embeds) return channel.send({ content: content });
        else if (!content) return channel.send({ embeds: [embeds] });
        else if (content && embeds) return channel.send({ content: content, embeds: [embeds] });
        else return;
    },

    r: function (channel, author, content, embeds) {  //New global send function due to discord.js changing it too much
        if (!channel || !author || !channel.guild.me.permissionsIn(channel).has("VIEW_CHANNEL") || !channel.guild.me.permissionsIn(channel).has("SEND_MESSAGES")) return;
        else if (!embeds) return channel.send({ content: `${author} ${content}` });
        else if (!content) return channel.send({ content: `${author}`, embeds: [embeds] });
        else if (content && embeds) return channel.send({ content: `${author} ${content}`, embeds: [embeds] });
        else return;
    },

    e: function (message, channel, content, embeds) {
        if (!message || !channel.guild.me.permissionsIn(channel).has("SEND_MESSAGES")) return;
        else if (!embeds) return message.edit({ content: content });
        else if (!content) return message.edit({ embeds: [embeds] });
        else if (content && embeds) return message.edit({ content: content, embeds: [embeds] });
        else return;
    },

    hasPermissions: async function (message, commandType) {
        let guildID = message.guild.id;
        let roleIDs = message.member.roles.cache.map(roles => roles.id);
        let userID = message.member.id;

        if (commandType == "everyone") return true;
        else if (message.member.permissions.has("ADMINISTRATOR")
            || message.author.id == process.env.USERID) return true;
        else {
            let permissions = await db.findOne({ guildID: guildID }).clone().catch(err => err);
            if (!permissions) return false
            else {
                let modRolesIDs = permissions.modRoles.map(role => role.roleID);
                let memberRolesIDs = permissions.memberRoles.map(role => role.roleID)

                if (commandType === "moderator") {
                    if (modRolesIDs.includes(userID)) return true;
                    else if (modRolesIDs.some(id => roleIDs.includes(id))) return true;
                    else return false;
                } else if (commandType === "member") {
                    if (memberRolesIDs.includes(userID)) return true;
                    else if (memberRolesIDs.some(id => roleIDs.includes(id))) return true;
                    else return false;
                }
            }
        }
    },

    getCommandStatus: async function (message, command) {
        let guildID = message.guild.id;

        let commandStatus = await
            db.findOne({
                guildID: guildID,
                commands: { $elemMatch: { name: command } }
            }).clone().catch(err => err);
        if (commandStatus) {
            if (commandStatus.commands[commandStatus.commands.map(cmd => cmd.name).indexOf(command)].status === true) return true;
            else return false;
        } else return;
    },

    findID: async function (message, input, type) {
        if (type === "user") {
            let user = await message.guild.members.fetch(input);
            let userMention = await message.guild.members.fetch(input.replace(/\D/g, ''));
            if (user) return input;
            else if (userMention) return userMention.id;
            else return undefined;
        } else if (type === "role") {
            let role = await message.guild.roles.fetch(input);
            let roleMention = await message.guild.roles.fetch(input.replace(/\D/g, ''));
            if (role) return input
            else if (roleMention) return roleMention.id;
            else return undefined;
        }
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

        const filter = (reaction, user) => { return validReactions.includes(reaction.emoji.name) && user.id === author.id };

        return message
            .awaitReactions({ filter, max: 1, time: time })
            .then(collected => collected.first() && collected.first().emoji.name).catch(err => console.log(`There was an error in prompMesssage ${err}`));
    },

    //Adds certain reaction, waits for certain amount of reactions, waits certain amount of time, returns all user objects
    awaitReaction: async function (message, max, time, emoji) {
        message.react(emoji).catch(err => err);

        const filter = (reaction, user) => { return emoji == reaction.emoji.name && user.id !== message.author.id };

        return message
            .awaitReactions({ filter, max: max, time: time })
            .then(collected => {
                if (collected.first()) return collected.first().users.cache.map(usr => usr).filter(usr => !usr.bot);
                else return message.reactions.cache.get(`${emoji}`).users.cache.map(usr => usr).filter(usr => !usr.bot);
            }).catch(err => console.log(`There was an error in awaitReaction ${err}`));
    },

    pageList: async function (message, author, array, embed, parameter) {
        let size = 10;
        let page = 0;

        for (let i = 0; i < size && i < array.length; i++) {
            embed.addField(`${parameter} ${i + 1}`, array[i]);
        }

        module.exports.e(message, message.channel, '', embed);

        module.exports.pageTurn(message, author, array, embed, parameter, size, page);
    },

    pageTurn: async function (message, author, array, embed, parameter, size, page) {
        let pages = Math.ceil(array.length / size) - 1; //subtract 1 because page starts at 0
        let newPage = page;
        embed.fields = [];

        for (let i = newPage * size; i < (newPage + 1) * size && i < array.length; i++) {
            embed.addField(`${parameter} ${i + 1}`, array[i]);
        }

        module.exports.e(message, message.channel, '', embed);

        if (newPage == 0) {
            const reacted = await module.exports.promptMessage(message, author, 15, ["➡️", "🗑️"])
            if (reacted == "➡️") {
                message.reactions.removeAll().then(() => {
                    newPage++;
                    module.exports.pageTurn(message, author, array, embed, parameter, size, newPage);
                }).catch(err => err);
            } else if (reacted == "🗑️") {
                return module.exports.del(message, 0);
            } else return module.exports.del(message, 0);
        } else if (newPage !== 0 && newPage !== pages) {
            const reacted = await module.exports.promptMessage(message, author, 15, ["⬅️", "➡️", "🗑️"])
            if (reacted == "➡️") {
                message.reactions.removeAll().then(() => {
                    newPage++;
                    module.exports.pageTurn(message, author, array, embed, parameter, size, newPage);
                }).catch(err => err);
            } else if (reacted == "⬅️") {
                message.reactions.removeAll().then(() => {
                    newPage--;
                    module.exports.pageTurn(message, author, array, embed, parameter, size, newPage);
                }).catch(err => err);
            } else if (reacted == "🗑️") {
                module.exports.del(message, 0);
            } else return module.exports.del(message, 0);
        } else if (newPage == pages) {
            const reacted = await module.exports.promptMessage(message, author, 15, ["⬅️", "🗑️"])
            if (reacted == "⬅️") {
                message.reactions.removeAll().then(() => {
                    newPage--;
                    module.exports.pageTurn(message, author, array, embed, parameter, size, newPage);
                }).catch(err => err);
            } else if (reacted == "🗑️") {
                return module.exports.del(message, 0);
            } else return module.exports.del(message, 0);
        }
    },

    bulkDeleteCount: async function (message) {
        let messagesDeleted = await
            message.channel.messages.fetch({ limit: spamUsers.find(user => user.id === message.author.id).offences }).then(messages => {
                const spamMessages = messages.filter(msg => msg.member);
                message.channel.bulkDelete(spamMessages).catch(err =>
                    module.exports.s(message.channel, "I am missing permissions to `MANAGE_MESSAGES` to delete spam messages."))
                    .then(m => module.exports.del(m, 7500));
                return spamMessages.array().length;
            }).catch(err => {
                return undefined;
            })
        return messagesDeleted;
    },

    warn: async function (message, userArray, type) {
        const logChannel = message.guild.channels.cache.find(c => c.name.includes("mod-logs")) || message.channel;

        const embed = new MessageEmbed()
            .setColor("#ff0000")
            .setTitle("Member Warned")
            .setThumbnail(message.guild.me.user.displayAvatarURL())
            .setFooter({ text: message.guild.me.displayName, iconURL: message.guild.me.displayAvatarURL() })
            .setTimestamp()
            .setDescription(stripIndents`
            **Member warned for ${type}:** ${message.member} (${message.author.id})
            **Warned By:** ${message.guild.me}`)

        if (type === "profanity") {
            embed.addField("Channel:", `${message.channel}`);
            embed.addField("Message Deleted", `||${message.content}||`);
        }

        if (userArray.some(user => user.id === message.author.id)) {
            userArray.find(user => user.id === message.author.id).offences += 1;
            if (userArray.some(user => user.id == message.author.id && user.offences < 3)) {
                module.exports.s(logChannel, '', embed);
                return module.exports.r(message.channel, message.author, `You will be timed out for ${type} if this continues.`).then(m => module.exports.del(m, 7500));
            } else if (userArray.some(user => user.id == message.author.id && user.offences == 3)) {
                module.exports.punish(message, userArray, type);
            } else if (userArray.some(user => user.id == message.author.id && user.offences == 4)) {
                module.exports.s(logChannel, '', embed);
                return module.exports.r(message.channel, message.author, `You will be timed out for ${type} if this continues.`).then(m => module.exports.del(m, 7500));
            } else if (userArray.some(user => user.id == message.author.id && user.offences == 5)) {
                module.exports.punish(message, userArray, type);
            }
        } else {
            userArray.push({ id: message.author.id, offences: 1 });
            module.exports.s(logChannel, '', embed);
            return module.exports.r(message.channel, message.author, `Your messages were deleted for ${type}.`).then(m => module.exports.del(m, 7500));
        }
    },

    punish: async function (message, userArray, reason) {
        const logChannel = message.guild.channels.cache.find(c => c.name.includes("mod-logs")) || message.channel;

        const embed = new MessageEmbed()
            .setColor("#ff0000")
            .setTitle("Member Timed Out")
            .setThumbnail(message.guild.me.user.displayAvatarURL())
            .setFooter({ text: message.guild.me.displayName, iconURL: message.guild.me.displayAvatarURL() })
            .setTimestamp()
            .setDescription(stripIndents`
            **Timeout Member:** ${message.member} (${message.author.id})
            **Timed Out By:** ${message.guild.me}
            **Reason:** ${reason}`)

        if (message.guild.me.permissions.has("MANAGE_ROLES")) {
            if (userArray.some(user => user.id == message.author.id && user.offences == 5)) {
                message.member.timeout(300000, `${reason}`).then(() => {
                    message.member.send(`Hello, you have been **timed out** **for 5 minutes** in ${message.guild.name} for: **${reason}**`).catch(err => err); //in case DM's are closed
                    module.exports.r(message.channel, message.author, `${message.member.user.username} was successfully timed out for **5 minutes** for **${reason}**.`).then(m => module.exports.del(m, 7500));
                    embed.addField("Timeout Time: ", "5 minutes");
                    module.exports.s(logChannel, '', embed);
                }).catch(err => {
                    if (err) return module.exports.r(message.channel, message.author, `There was an error attempting to timeout ${message.member}: ${err}`).then(m => module.exports.del(m, 7500));
                }).then(setTimeout(() => {
                    message.member.send(`Hello, your **timeout** has been removed in ${message.guild.name} for: **${reason}**`).catch(err => err); //in case DM's are closed
                    module.exports.r(message.channel, message.author, `${message.member.user.username} was successfully removed from timeout.`).then(m => module.exports.del(m, 7500));
                }, 300000)).catch(err => {
                    if (err) return module.exports.r(message.channel, message.author, `There was an error attempting to untime out ${message.member} ${err}`).then(m => module.exports.del(m, 7500));
                });
            } else if (userArray.some(user => user.id == message.author.id && user.offences == 7)) {
                message.member.timeout(600000, `${reason}`).then(() => {
                    message.member.send(`Hello, you have been **timed out** **for 10 minutes** in ${message.guild.name} for: **${reason}**`).catch(err => err); //in case DM's are closed
                    module.exports.r(message.channel, message.author, `${message.member.user.username} was successfully timed out for **10 minutes** for **${reason}**.`).then(m => module.exports.del(m, 7500));
                    embed.addField("Timeout Time: ", "10 minutes");
                    module.exports.s(logChannel, '', embed);
                }).catch(err => {
                    if (err) return module.exports.r(message.channel, message.author, `There was an error attempting to timeout ${message.member} ${err}`).then(m => module.exports.del(m, 7500));
                }).then(setTimeout(() => {
                    userArray.splice(userArray.findIndex(user => user.id === message.author.id), 1)
                    message.member.send(`Hello, your **timeout** has been removed in ${message.guild.name}`).catch(err => err); //in case DM's are closed
                    module.exports.r(message.channel, message.author, `${message.member.user.username} was successfully removed from timeout.`).then(m => module.exports.del(m, 7500));
                }, 600000)).catch(err => {
                    if (err) return module.exports.r(message.channel, message.author, `There was an error attempting to untime out ${message.member} ${err}`).then(m => module.exports.del(m, 7500));
                });
            }
        } else {
            return module.exports.s(message.channel, "I am missing permissions to `TIMEOUT_MEMBERS` to timeout users for spam/profanity.").then(m => module.exports.del(m, 7500));
        }
    }
}