const { EmbedBuilder, PermissionFlagsBits, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require("discord.js");

module.exports = {
    //Delete
    del: function (message, timeout) {
        if (!message || !message?.id) return;
        const channelPermissions = message.channel.permissionsFor(message.guild.members.me);
        if (message.author.id !== message.guild.members.me.id
            && !channelPermissions?.has(PermissionFlagsBits.ManageMessages)) return;

        setTimeout(() => {
            if (message.deletable && !message.reactions.cache?.get('🛑'))
                message.delete().catch(err => err);
            else message.reactions.removeAll().catch(err => err);
        }, timeout);
    },

    //Delete reply
    delr: async function (interaction, timeout) {
        if (!interaction || !interaction.replied) return;
        if (!timeout || timeout == 0) return interaction.deleteReply().catch(err => err);

        const saveButton = new ButtonBuilder()
            .setCustomId(`save-${interaction.user.id}`)
            .setLabel('Save Message')
            .setStyle(ButtonStyle.Success);

        const delButton = new ButtonBuilder()
            .setCustomId(`delete-${interaction.user.id}`)
            .setLabel('Delete Message')
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder()
            .addComponents(saveButton, delButton);

        await interaction.editReply({ components: [row] });

        const filter = i => i.user.id === interaction.user.id;
        const message = await interaction.fetchReply();
        const collector = message.createMessageComponentCollector({ filter, time: timeout });

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

        const reply = {
            content: content || undefined,
            embeds: (embeds && embeds.length > 0 ? [embeds] : []),
            components: (components && components.components?.length > 0 ? [components] : [])
        };

        try {
            return await channel.send(reply);
        } catch (error) {
            console.error("Stack trace:", new Error().stack);
        }
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

        const reply = {
            content: content || undefined,
            embeds: (embeds && embeds.length > 0 ? [embeds] : []),
            components: (components && components.components?.length > 0 ? [components] : []),
            flags: MessageFlags.Ephemeral
        };

        try {
            return await interaction.reply(reply);
        } catch (error) {
            console.error("Stack trace:", new Error().stack);
        }
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

        const reply = {
            content: content || undefined,
            embeds: (embeds && embeds.length > 0 ? [embeds] : []),
            components: (components && components.components?.length > 0 ? [components] : [])
        };

        try {
            return await interaction.reply(reply);
        } catch (error) {
            console.error("Stack trace:", new Error().stack);
        }
    },

    //Edit
    e: async function (message, content, embeds, components) {
        if (!message || !message.id) return;
        if (!content && !embeds && !components) return;
        const channelPermissions = message.channel.permissionsFor(message.guild.members.me) || null;
        if (!channelPermissions?.has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages])) return;
        if (message.channel == ChannelType.PublicThread || message.channel == ChannelType.PrivateThread
            && !channelPermissions?.has(PermissionFlagsBits.SendMessagesInThreads)) return;
        if (message.guild.members.me.isCommunicationDisabled()) return;

        const reply = {
            content: content || undefined,
            embeds: (embeds && embeds.length > 0 ? [embeds] : []),
            components: (components && components.components?.length > 0 ? [components] : [])
        };

        return await message.edit(reply).catch(err => err);
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

        const reply = {
            content: content || undefined,
            embeds: (embeds && embeds.length > 0 ? [embeds] : []),
            components: (components && components.components?.length > 0 ? [components] : [])
        };

        return await interaction.editReply(reply).catch(err => err);
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
                if (collected.size === 0) module.exports.delr(interaction, 0);
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
}