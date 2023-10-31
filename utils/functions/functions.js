const { PermissionFlagsBits, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const db = require('../schemas/db.js');
const { EmbedBuilder } = require("discord.js");
const { stripIndents } = require("common-tags");

module.exports = {
    //Delete
    del: function (message, timeout) {
        if (!message || !message?.id) return;
        const channelPermissions = message.channel.permissionsFor(message.guild.members.me);
        if (!channelPermissions?.has(PermissionFlagsBits.ManageMessages)) return;
        setTimeout(() => {
            if (message.deletable && !message.reactions.cache?.get('🛑'))
                message.delete().catch(err => err);
            else message.reactions.removeAll().catch(err => err);
        }, timeout);
    },

    //Send
    s: async function (channel, content, embeds) {
        const channelPermissions = channel.permissionsFor(channel.guild.members.me);
        if (!channelPermissions?.has(PermissionFlagsBits.ViewChannel)
            || !channelPermissions?.has(PermissionFlagsBits.SendMessages)) return;
        if (channel == ChannelType.PublicThread
            || channel == ChannelType.PrivateThread
            && !channelPermissions?.has(PermissionFlagsBits.SendMessagesInThreads)) return;
        if (channel.guild.members.me.isCommunicationDisabled()) return;
        else if (!embeds) return await channel.send({ content: `${content}` });
        else if (!content) return await channel.send({ embeds: [embeds] });
        else if (content && embeds) return await channel.send({ content: `${content}`, embeds: [embeds] });
        else return;
    },

    //Reply
    r: async function (interaction, content, embeds) {
        const channelPermissions = interaction.channel.permissionsFor(interaction.guild.members.me);
        if (!channelPermissions?.has(PermissionFlagsBits.ViewChannel)
            || !channelPermissions?.has(PermissionFlagsBits.SendMessages)) return;
        if (interaction.channel == ChannelType.PublicThread
            || interaction.channel == ChannelType.PrivateThread
            && !channelPermissions?.has(PermissionFlagsBits.SendMessagesInThreads)) return;
        if (interaction.guild.members.me.isCommunicationDisabled()) return;
        else if (!embeds) return await interaction.reply({ content: `${content}` });
        else if (!content) return await interaction.reply({ embeds: [embeds] });
        else if (content && embeds) return await interaction.reply({ content: `${content}`, embeds: [embeds] });
        else return;
    },

    //Reply ephemeral
    re: async function (interaction, content, embeds) {
        const channelPermissions = interaction.channel.permissionsFor(interaction.guild.members.me);
        if (!channelPermissions?.has(PermissionFlagsBits.ViewChannel)
            || !channelPermissions?.has(PermissionFlagsBits.SendMessages)) return;
        if (interaction.channel == ChannelType.PublicThread
            || interaction.channel == ChannelType.PrivateThread
            && !channelPermissions?.has(PermissionFlagsBits.SendMessagesInThreads)) return;
        if (interaction.guild.members.me.isCommunicationDisabled()) return;
        else if (!embeds) return await interaction.reply({ content: `${content}`, ephemeral: true });
        else if (!content) return await interaction.reply({ embeds: [embeds], ephemeral: true });
        else if (content && embeds) return await interaction.reply({ content: `${content}`, embeds: [embeds], ephemeral: true });
        else return;
    },

    //Edit
    e: function (interaction, content, embeds) {
        const channelPermissions = interaction.channel.permissionsFor(interaction.guild.members.me);
        if (!channelPermissions?.has(PermissionFlagsBits.ViewChannel)
            || !channelPermissions?.has(PermissionFlagsBits.SendMessages)) return;
        if (interaction.channel == ChannelType.PublicThread
            || interaction.channel == ChannelType.PrivateThread
            && !channelPermissions?.has(PermissionFlagsBits.SendMessagesInThreads)) return;
        if (interaction.guild.members.me.isCommunicationDisabled()) return;
        else if (!embeds) return interaction.edit({ content: content });
        else if (!content) return interaction.edit({ embeds: [embeds] });
        else if (content && embeds) return interaction.edit({ content: content, embeds: [embeds] });
        else return;
    },

    //Has permissions for a command
    hasPermissions: async function (message, commandType) {
        if (!message) return;

        let guildID, roleIDs, userID;

        if (message.member) {
            guildID = message.guild.id;
            roleIDs = message.member.roles.cache.map(roles => roles.id);
            userID = message.member.id;
        } else return;

        if (commandType == "member") return true;
        else if (message.member.permissions.has(PermissionFlagsBits.ManageRoles)
            || message.author.id == process.env.USERID) return true;
        else {
            let permissions = await db.findOne({ guildID: guildID }).catch(err => err);
            if (!permissions) return false;

            let modRolesIDs = permissions.modRoles.map(role => role.roleID);

            if (commandType == "moderator") {
                if (modRolesIDs.includes(userID)) return true;
                else if (modRolesIDs.find(id => roleIDs.includes(id))) return true;
                else return false;
            }
        }
    },

    //Check if command is enabled or not
    getCommandStatus: async function (message, command) {
        if (!message || !command) return;
        let guildID = message.guild.id;

        let commandStatus = await
            db.findOne({
                guildID: guildID,
                commands: { $elemMatch: { name: command } }
            }).catch(err => err);
        if (!commandStatus) return;
        if (commandStatus.commands[commandStatus.commands.map(cmd => cmd.name).indexOf(command)].status === true) return true;
        else return false;
    },

    //Attempt to find user/role ID of input
    findID: async function (message, input) {
        if (!message || !input) return;

        let user = await message.guild.members.fetch(input).catch(err => { return; })
        let role = await message.guild.roles.fetch(input).catch(err => { return; });
        let userMention = await message.guild.members.fetch(input.replace(/\D/g, '')).catch(err => { return; });
        let roleMention = await message.guild.roles.fetch(input.replace(/\D/g, '')).catch(err => { return; });
        if (user || role) return input;
        else if (userMention) return userMention.id;
        else if (roleMention) return roleMention.id;
        else return;
    },

    //Format date to MM/DD/YYYY format
    formatDate: function (date) {
        let year = date.getFullYear();
        let month = (1 + date.getMonth()).toString().padStart(2, '0');
        let day = date.getDate().toString().padStart(2, '0');

        return month + '/' + day + '/' + year;
    },

    //Creates a simple message collector with a filter to exclude bot reactions
    simplePrompt: function (interaction, buttons) {
        const row = new ActionRowBuilder()
            .addComponents(buttons.map(button =>
                new ButtonBuilder()
                    .setCustomId(`${button}`)
                    .setLabel(`${button}`)
                    .setStyle(ButtonStyle.Secondary)
            ).filter(x => x).slice(0, 4));
        let row2;
        if (buttons.length > 3)
            row2 = new ActionRowBuilder()
                .addComponents(buttons.map(button =>
                    new ButtonBuilder()
                        .setCustomId(`${button}`)
                        .setLabel(`${button}`)
                        .setStyle(ButtonStyle.Secondary)
                ).slice(4, 8));

        const filter = i => buttons.includes(i.customId);

        if (row2) interaction.edit({ components: [row, row2] })
        else interaction.edit({ components: [row] })

        return collector = interaction.channel.createMessageComponentCollector({ filter });
    },

    //Returns the reaction added by the author of the message 
    messagePrompt: async function (message, author, time, validReactions) {
        if (!message.channel.permissionsFor(message.guild.me).has("ADD_REACTIONS"))
            return r(message.channel, message.author, "I am missing permissions to `ADD_REACTIONS` in this channel for this command.").then(m => module.exports.del(m, 30000));

        time *= 1000;

        for (const reaction of validReactions) message.react(reaction).catch(err => err);

        const filter = (reaction, user) => { return validReactions.includes(reaction.emoji.name) && user.id === author.id && user.id !== message.guild.me.id };

        return message.awaitReactions({ filter, max: 1, time: time })
            .then(collected => collected.first() && collected.first().emoji.name).catch(err => console.log(`There was an error in messagePrompt ${err}`));
    },

    //Adds certain reaction, waits for certain amount of reactions, waits certain amount of time, returns all user objects
    collectReactors: async function (message, max, time, emoji) {
        if (!message.channel.permissionsFor(message.guild.me).has("ADD_REACTIONS"))
            return r(message.channel, message.author, "I am missing permissions to `ADD_REACTIONS` in this channel for this command.").then(m => module.exports.del(m, 30000));

        message.react(emoji).catch(err => err);

        const filter = (reaction, user) => { return emoji == reaction.emoji.name && user.id !== message.author.id && user.id !== message.client.user.id };

        return message
            .awaitReactions({ filter, max: max, time: time })
            .then(collected => {
                if (collected.first()) return collected.first().users.cache.map(usr => usr).filter(usr => !usr.bot);
                else return message.reactions.cache.get(`${emoji}`).users.cache.map(usr => usr).filter(usr => !usr.bot);
            }).catch(err => console.log(`There was an error in collectReactions ${err}`));
    },

    //Paging system for Embed Fields
    pageList: async function (message, author, array, embed, parameter, size, page) {
        let pages = Math.ceil(array.length / size) - 1, newPage = page;                //subtract 1 because page starts at 0
        embed.setFooter({ text: "React with \`⬅️\` & \`➡️\` to navigate, \`🗑️\` to discard, \`❤️\` to save." }).fields = [];

        for (let i = newPage * size; i < (newPage + 1) * size && i < array.length; i++) {
            embed.addFields({ name: `${parameter} ${i + 1}`, value: `${array[i]}` });
        }

        module.exports.e(message, message.channel, '', embed);

        if (newPage == 0) {
            const reacted = await module.exports.messagePrompt(message, author, 15, ["➡️", "🗑️", "❤️"])
            if (reacted == "➡️") {
                message.reactions.removeAll()
                    .then(module.exports.pageList(message, author, array, embed, parameter, size, ++newPage)).catch(err => err);
            } else if (reacted == "🗑️") return module.exports.del(message, 0);
            else if (reacted == "❤️") {
                message.reactions.removeAll().catch(err => err);
                delete embed.footer;
                module.exports.e(message, message.channel, '', embed.setTimestamp());
            } else return module.exports.del(message, 0);
        } else if (newPage !== 0 && newPage !== pages) {
            const reacted = await module.exports.messagePrompt(message, author, 15, ["⬅️", "➡️", "🗑️", "❤️"])
            if (reacted == "➡️") {
                message.reactions.removeAll()
                    .then(module.exports.pageList(message, author, array, embed, parameter, size, ++newPage)).catch(err => err);
            } else if (reacted == "⬅️") {
                message.reactions.removeAll()
                    .then(module.exports.pageList(message, author, array, embed, parameter, size, --newPage)).catch(err => err);
            } else if (reacted == "🗑️") module.exports.del(message, 0);
            else if (reacted == "❤️") {
                message.reactions.removeAll().catch(err => err);
                delete embed.footer;
                module.exports.e(message, message.channel, '', embed.setTimestamp());
            } else return module.exports.del(message, 0);
        } else if (newPage == pages) {
            const reacted = await module.exports.messagePrompt(message, author, 15, ["⬅️", "🗑️", "❤️"])
            if (reacted == "⬅️") {
                message.reactions.removeAll()
                    .then(module.exports.pageList(message, author, array, embed, parameter, size, --newPage)).catch(err => err);
            } else if (reacted == "🗑️") return module.exports.del(message, 0);
            else if (reacted == "❤️") {
                message.reactions.removeAll().catch(err => err);
                delete embed.footer;
                module.exports.e(message, message.channel, '', embed.setTimestamp());
            } else return module.exports.del(message, 0);
        }
    },

    //Warns user for action
    warn: async function (message, reason, extra) {
        const logChannel = message.guild.channels.cache.find(c => c.name.includes("action-logs"))
            || message.guild.channels.cache.find(c => c.name.includes("mod-logs")) || message.channel;

        const embed = new EmbedBuilder()
            .setTitle(`Warning For: __**${reason}**__!`)
            .setThumbnail(message.author.displayAvatarURL())
            .setColor("#ff0000")
            .setFooter({ text: message.member.user.tag, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();

        if (!warnUsers || !warnUsers.find(user => user.id === message.author.id)) {
            warnUsers.push({ id: message.author.id, offences: 1 });
            if (reason == "Phishing Link") embed.addFields({ name: '__**DO NOT**__ use/open this link:', value: `||${extra}||` });
            embed.setDescription(`**Warning:** ${message.member} will receive a __**timeout**__ if this continues.`);

            module.exports.s(message.channel, '', embed);

            embed.fields = [];
            embed.setTitle(`Member Warned For: ${reason}`)
                .setDescription(stripIndents`
                **Member Warned:** ${message.member} (${message.member.id})
                **Channel:** ${message.channel}
                **Warning: __#1__**`);
            if (reason == "Phishing Link") embed.addFields({ name: '__**DO NOT**__ use/open this link:', value: `||${extra}||` });
            embed.addFields({ name: "Message Deleted: ", value: `||${message.content}||` });

            module.exports.s(logChannel, '', embed);
        } else {
            warnUsers.find(user => user.id === message.author.id).offences += 1;
            if (warnUsers.find(user => user.id == message.author.id && user.offences < 3)) {
                const offence = warnUsers.find(user => user.id === message.author.id).offences;
                if (reason == "Phishing Link") embed.addFields({ name: '__**DO NOT**__ use/open this link:', value: `||${extra}||` });
                embed.setDescription(`**Warning:** ${message.member} will receive a __**timeout**__ if this continues.`);

                module.exports.s(message.channel, '', embed);

                embed.fields = [];
                embed.setTitle(`Member Warned For: ${reason}`)
                    .setDescription(stripIndents`
                    **Member Warned:** ${message.member} (${message.member.id})
                    **Channel:** ${message.channel}
                    **Warning: __#${offence}__**`);
                if (reason == "Phishing Link") embed.addFields({ name: '__**DO NOT**__ use/open this link:', value: `||${extra}||` });
                embed.addFields({ name: "Message Deleted: ", value: `||${message.content}||` });

                module.exports.s(logChannel, '', embed);
            } else if (warnUsers.find(user => user.id == message.author.id && user.offences))
                module.exports.punish(message, reason, warnUsers.find(user => user.id === message.author.id).offences, extra);
        }
        if (warnUsers?.find(user => user.id === message.author.id))
            return module.exports.checkWarnUsers(message.author.id, warnUsers.find(user => user.id === message.author.id).offences);
        else return;
    },

    //Punish user for action
    punish: async function (message, reason, offence, extra) {
        const logChannel = message.guild.channels.cache.find(c => c.name.includes("action-logs"))
            || message.guild.channels.cache.find(c => c.name.includes("mod-logs")) || message.channel;

        const embed = new EmbedBuilder()
            .setTitle(`Action Taken For: __**${reason}**__!`)
            .setThumbnail(message.author.displayAvatarURL())
            .setColor("#ff0000")
            .setFooter({ text: message.member.user.tag, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();

        if (!message.guild.me.permissions.has("MANAGE_ROLES"))
            return module.exports.s(message.channel, "I am missing permissions to `TIMEOUT_MEMBERS` to timeout users for profanity/bad words.").then(m => module.exports.del(m, 7500));
        if (warnUsers.find(user => user.id == message.author.id && user.offences == 3)) {
            message.member.timeout(300000, `${reason}`).then(() => {
                message.member.send(`Hello, you received a **5 minute __timeout__** in **${message.guild.name}** for: __**${reason}**__.`).catch(err => err); //in case DM's are closed
                if (reason == "Phishing Link") embed.addFields({ name: '__**DO NOT**__ use/open this link:', value: `||${extra}||` });
                embed.setDescription(`**Timeout Time:** ${message.member} received a __**5 minute timeout**__.`);

                module.exports.s(message.channel, '', embed);

                embed.fields = [];
                embed.setTitle(`Member Timed Out For ${reason}`)
                    .setDescription(`
                        **Member Timed Out:** ${message.member} (${message.author.id})
                        **Channel:** ${message.channel}
                        **Warning: __#${offence}__**
                        **Timeout Time: __5 minutes__**`);

                if (reason == "Phishing Link") embed.addFields({ name: '__**DO NOT**__ use/open this link:', value: `||${extra}||` });
                embed.addFields({ name: "Message Deleted: ", value: `||${message.content}||` });

                return module.exports.s(logChannel, '', embed);
            }).catch(err => {
                return module.exports.r(logChannel, message.author, `There was an error attempting to timeout ${message.member}: ${err}`);
            }).then(setTimeout(() => {
                embed.fields = [];
                embed.setTitle("Member Timeout Expired")
                    .setColor("#00ff00")
                    .setDescription(`**Member:** <@${message.author.id}> (${message.author.id})\n**Timeout Time:  __5 minute__** timeout expired`);

                return module.exports.s(logChannel, '', embed);
            }, 300000)).catch(err => {
                if (err) return module.exports.r(logChannel, message.author, `There was an error attempting to un-timeout ${message.member} ${err}`);
            });
        } else if (warnUsers.find(user => user.id == message.author.id && user.offences == 4)) {
            message.member.timeout(600000, `${reason}`).then(() => {
                message.member.send(`Hello, you received a **10 minute __timeout__** in **${message.guild.name}** for: __**${reason}**__.`).catch(err => err); //in case DM's are closed
                if (reason == "Phishing Link") embed.addFields({ name: '__**DO NOT**__ use/open this link:', value: `||${extra}||` });
                embed.setDescription(`**Timeout Time:** ${message.member} received a __**10 minute timeout**__.`);

                module.exports.s(message.channel, '', embed);

                embed.fields = [];
                embed.setTitle(`Member Timed Out For ${reason}`)
                    .setDescription(`
                        **Member Timed Out:** ${message.member} (${message.author.id})
                        **Channel:** ${message.channel}
                        **Warning: __#${offence}__**
                        **Timeout Time: __10 minutes__**`);

                if (reason == "Phishing Link") embed.addFields({ name: '__**DO NOT**__ use/open this link:', value: `||${extra}||` });
                embed.addFields({ name: "Message Deleted: ", value: `||${message.content}||` });

                return module.exports.s(logChannel, '', embed);
            }).catch(err => {
                if (err) return module.exports.r(logChannel, message.author, `There was an error attempting to timeout ${message.member} ${err}`);
            }).then(setTimeout(() => {
                warnUsers.splice(warnUsers.findIndex(user => user.id === message.author.id), 1);
                embed.fields = [];
                embed.setTitle("Member Timeout Expired")
                    .setColor("#00ff00")
                    .setDescription(`**Member:** <@${message.author.id}> (${message.author.id})\n**Timeout Time:  __10 minute__** timeout expired`);

                return module.exports.s(logChannel, '', embed);
            }, 600000)).catch(err => {
                if (err) return module.exports.r(message.channel, message.author, `There was an error attempting to un-timeout ${message.member} ${err}`).then(m => module.exports.del(m, 7500));
            });
        }
    },

    //Remove users after 30 minutes from warnUsers if no more offences
    checkWarnUsers: function (id, offences) {
        let warnedUsers = setTimeout(() => {
            clearInterval(intervalCheck);
            if (warnUsers.find(user => user.id === id)?.offences == offences) {
                warnUsers.splice(warnUsers.findIndex(user => user.id === id), 1);
            }
        }, (60000 * 30)); //15 minutes = (60000*15) || 30 minutes = (60000*30)
        let intervalCheck = setInterval(() => {
            if (warnUsers.find(user => user.id === id)?.offences > offences) {
                clearInterval(intervalCheck);
                clearTimeout(warnedUsers)
            }
        }, 1000);
    },
}