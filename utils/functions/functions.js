const { EmbedBuilder, PermissionFlagsBits, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

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

    //Delete reply
    delr: async function (interaction, timeout) {
        if (!interaction) return;
        if (!timeout || timeout == 0) return interaction.deleteReply().catch(err => err);

        const saveButton = new ButtonBuilder()
            .setCustomId('save')
            .setLabel('Save Message')
            .setStyle(ButtonStyle.Success);

        const delButton = new ButtonBuilder()
            .setCustomId('delete')
            .setLabel('Delete Message')
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder()
            .addComponents(saveButton, delButton);

        await interaction.editReply({ components: [row] });

        const filter = i => i.user.id === interaction.user.id;
        const message = await interaction.fetchReply();
        const collector = message.createMessageComponentCollector({ filter, time: timeout });

        collector.on('collect', async i => {
            if (i.customId === 'save') {
                await i.update({ components: [] }).catch(err => err);
                collector.stop();
            } else if (i.customId === 'delete') {
                await i.deferUpdate().catch(err => err);
                await i.deleteReply().catch(err => err);
                collector.stop();
            }
        });

        collector.on('end', collected => {
            if (collected.size === 0) interaction.deleteReply().catch(err => err);
        });
    },

    //Send
    s: async function (channel, content, embeds, components) {
        if (!channel) return;
        if (!content && !embeds && !components) return;
        const channelPermissions = channel.permissionsFor(channel.guild.members.me) || null;
        if (!channelPermissions?.has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages])) return;
        if (channel == ChannelType.PublicThread || channel == ChannelType.PrivateThread
            && !channelPermissions?.has(PermissionFlagsBits.SendMessagesInThreads)) return;
        if (channel.guild.members.me.isCommunicationDisabled()) return;

        let reply = {
            content: content || undefined,
            embeds: (embeds && embeds.length > 0 ? [embeds] : []),
            components: (components && components.components?.length > 0 ? [components] : [])
        };

        return await channel.send(reply);
    },

    //Reply ephemeral
    re: async function (interaction, content, embeds, components) {
        if (!interaction) return;
        if (!content && !embeds && !components) return;
        const channelPermissions = interaction.channel.permissionsFor(interaction.guild.members.me) || null;
        if (!channelPermissions?.has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages])) return;
        if (interaction.channel == ChannelType.PublicThread || interaction.channel == ChannelType.PrivateThread
            && !channelPermissions?.has(PermissionFlagsBits.SendMessagesInThreads)) return;
        if (interaction.guild.members.me.isCommunicationDisabled()) return;

        let reply = {
            content: content || undefined,
            embeds: (embeds && embeds.length > 0 ? [embeds] : []),
            components: (components && components.components?.length > 0 ? [components] : []),
            ephemeral: true
        };

        return await interaction.reply(reply);
    },

    //Reply
    r: async function (interaction, content, embeds, components) {
        if (!interaction) return;
        if (!content && !embeds && !components) return;
        const channelPermissions = interaction.channel.permissionsFor(interaction.guild.members.me) || null;
        if (!channelPermissions?.has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages])) return;
        if (interaction.channel == ChannelType.PublicThread || interaction.channel == ChannelType.PrivateThread
            && !channelPermissions?.has(PermissionFlagsBits.SendMessagesInThreads)) return;
        if (interaction.guild.members.me.isCommunicationDisabled()) return;

        let reply = {
            content: content || undefined,
            embeds: (embeds && embeds.length > 0 ? [embeds] : []),
            components: (components && components.components?.length > 0 ? [components] : [])
        };

        return await interaction.reply(reply);
    },

    //Edit
    e: async function (message, content, embeds, components) {
        if (!message) return;
        if (!content && !embeds && !components) return;
        const channelPermissions = message.channel.permissionsFor(message.guild.members.me) || null;
        if (!channelPermissions?.has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages])) return;
        if (message.channel == ChannelType.PublicThread || message.channel == ChannelType.PrivateThread
            && !channelPermissions?.has(PermissionFlagsBits.SendMessagesInThreads)) return;
        if (message.guild.members.me.isCommunicationDisabled()) return;

        let reply = {
            content: content || undefined,
            embeds: (embeds && embeds.length > 0 ? [embeds] : []),
            components: (components && components.components?.length > 0 ? [components] : [])
        };

        return await message.edit(reply);
    },

    //Edit reply
    er: async function (interaction, content, embeds, components) {
        if (!interaction) return;
        if (!content && !embeds && !components) return;
        const channelPermissions = interaction.channel.permissionsFor(interaction.guild.members.me) || null;
        if (!channelPermissions?.has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages])) return;
        if (interaction.channel == ChannelType.PublicThread
            || interaction.channel == ChannelType.PrivateThread
            && !channelPermissions?.has(PermissionFlagsBits.SendMessagesInThreads)) return;
        if (interaction.guild.members.me.isCommunicationDisabled()) return;

        let reply = {
            content: content || undefined,
            embeds: (embeds && embeds.length > 0 ? [embeds] : []),
            components: (components && components.components?.length > 0 ? [components] : [])
        };

        return await interaction.editReply(reply)
    },

    //Creates a collector for an interaction and returns the result
    //Takes an ActionRowBuilder as a parameter
    simplePrompt: async function (interaction, row) {
        const buttons = row.components.map(button => button.toJSON().custom_id);

        const filter = i => buttons.includes(i.customId);

        interaction.editReply({ components: [row] });

        const reply = await interaction.fetchReply();
        const collector = reply.createMessageComponentCollector({ filter, max: 1 });

        return new Promise((resolve, reject) => {
            collector.on('collect', i => {
                i.deferUpdate().catch(err => err);
                resolve(i)
            });
            collector.on('end', collected => {
                if (collected.size === 0) reject('Time out');
            });
        });
    },

    //Simple Prompt with timeout and author filter
    //Takes an ActionRowBuilder as a parameter, and time in milliseconds
    messagePrompt: async function (interaction, row, time) {
        const buttons = row.components.map(button => button.toJSON().custom_id);

        const filter = i => i.user.id === interaction.user.id && buttons.includes(i.customId);

        interaction.editReply({ components: [row] });

        const reply = await interaction.fetchReply();
        const collector = reply.createMessageComponentCollector({ filter, time, max: 1 });

        return new Promise((resolve, reject) => {
            collector.on('collect', i => {
                i.deferUpdate().catch(err => err);
                resolve(i)
            });
            collector.on('end', collected => {
                if (collected.size === 0) reject('Time out');
            });
        });
    },

    //Paging system for Embed Fields
    pageList: async function (interaction, array, embed, parameter, size, page) {
        let pages = Math.ceil(array.length / size) - 1, newPage = page;
        embed.setFooter({ text: "Use the buttons to navigate, discard, or save." })
        embed.data.fields = [];

        for (let i = newPage * size; i < (newPage + 1) * size && i < array.length; i++) {
            embed.addFields({ name: `${parameter} ${i + 1}`, value: `${array[i]}` });
        }

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder().setCustomId('previous').setLabel('⬅️').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('next').setLabel('➡️').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('delete').setLabel('🗑️').setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId('save').setLabel('❤️').setStyle(ButtonStyle.Success)
            );

        await interaction.editReply({ embeds: [embed], components: [row] });

        try {
            const i = await module.exports.messagePrompt(interaction, row, 30000);
            i.deferUpdate().catch(err => err);
            switch (i.customId) {
                case 'next':
                    if (newPage < pages) {
                        module.exports.pageList(interaction, array, embed, parameter, size, ++newPage);
                    } else module.exports.pageList(interaction, array, embed, parameter, size, newPage);
                    break;
                case 'previous':
                    if (newPage > 0) {
                        module.exports.pageList(interaction, array, embed, parameter, size, --newPage);
                    } else module.exports.pageList(interaction, array, embed, parameter, size, newPage);
                    break;
                case 'delete':
                    await interaction.deleteReply();
                    break;
                case 'save':
                    delete embed.footer;
                    await interaction.editReply({ embeds: [embed], components: [] });
                    break;
            }
        } catch (error) {
            if (error === 'Time out') module.exports.delr(interaction, 0);
        }
    },

    //Warns user for action
    warn: async function (message, reason, extra) {
        const logChannel = message.guild.channels.cache.find(c => c.name.includes("action-logs"))
            || message.guild.channels.cache.find(c => c.name.includes("mod-logs")) || message.channel;

        const embed = new EmbedBuilder()
            .setTitle(`Warning For: __**${reason}**__!`)
            .setThumbnail(message.author.displayAvatarURL())
            .setColor("#FF0000")
            .setFooter({ text: message.member.user.tag, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();

        let userOffence = warnUsers.find(user => user.id === message.author.id);
        if (!userOffence) {
            warnUsers.push({ id: message.author.id, offences: 1 });
            userOffence = warnUsers.find(user => user.id === message.author.id);
        } else {
            userOffence.offences += 1;
        }

        if (reason == "Phishing Link") embed.addFields({ name: '__**DO NOT**__ use/open this link:', value: `||${extra}||` });
        embed.setDescription(`**Warning:** ${message.member} will receive a __**timeout**__ if this continues.`);

        module.exports.s(message.channel, '', embed);

        embed.data.fields = [];
        embed.setTitle(`Member Warned For: ${reason}`)
            .addFields({
                name: '__**Member**__',
                value: `${message.member}`,
                inline: true
            }, {
                name: '__**Channel**__',
                value: `${message.channel}`,
                inline: true
            }, {
                name: '__**Warning**__',
                value: `__#${userOffence.offences}__`,
                inline: true
            })

        if (reason == "Phishing Link") embed.addFields({ name: '__**DO NOT**__ use/open this link:', value: `||${extra}||` });
        embed.addFields({ name: "Message Deleted: ", value: `||${message.content}||` });

        module.exports.s(logChannel, '', embed);

        if (userOffence.offences >= 3) {
            module.exports.punish(message, reason, userOffence.offences, extra);
        }

        return module.exports.checkWarnUsers(message.author.id, userOffence.offences);
    },

    //Punish user for action
    punish: async function (message, reason, offence, extra) {
        const logChannel = message.guild.channels.cache.find(c => c.name.includes("action-logs"))
            || message.guild.channels.cache.find(c => c.name.includes("mod-logs")) || message.channel;

        const embed = new EmbedBuilder()
            .setTitle(`Action Taken For: __**${reason}**__!`)
            .setThumbnail(message.author.displayAvatarURL())
            .setColor("#FF0000")
            .setFooter({ text: message.member.user.tag, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();

        if (!message.guild.me.permissions.has(PermissionFlagsBits.ModerateMembers))
            return module.exports.s(message.channel, "I am missing permissions to `TIMEOUT_MEMBERS` to timeout users for profanity/bad words.").then(m => module.exports.del(m, 7500));

        const userOffence = warnUsers.find(user => user.id == message.author.id);
        if (!userOffence) return;

        const timeoutDuration = userOffence.offences == 3 ? 300000 : 600000;
        const timeoutMessage = `Hello, you received a **${timeoutDuration / 60000} minute __timeout__** in **${message.guild.name}** for: __**${reason}**__.`

        message.member.timeout(timeoutDuration, `${reason}`).then(() => {
            message.member.send(timeoutMessage).catch(err => err); //in case DM's are closed
            if (reason == "Phishing Link") embed.addFields({ name: '__**DO NOT**__ use/open this link:', value: `||${extra}||` });
            embed.setDescription(`**Timeout Time:** ${message.member} received a __**${timeoutDuration / 60000} minute timeout**__.`);
            module.exports.s(message.channel, '', embed);
            return setTimeout(() => {
                if (userOffence.offences == 4) warnUsers.splice(warnUsers.findIndex(user => user.id === message.author.id), 1);
            }, timeoutDuration);
        }).catch(err => {
            return module.exports.s(logChannel, `There was an error attempting to timeout ${message.member}: ${err}`);
        });
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