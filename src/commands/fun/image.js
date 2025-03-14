const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { r, re, er, delr } = require("../../../utils/functions/functions.js");
const gis = require('async-g-i-s');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('image')
        .setDescription('Searches for a google image.')
        .addStringOption(option => option.setName('query').setDescription('Image to search for').setRequired(true)),
    execute: async (interaction) => {
        const query = interaction.options.getString('query');

        try {
            const results = await gis(query);
            await r(interaction, "Image Search Results...");
            sendImage(interaction, results);
        } catch (err) {
            return re(interaction, "There was an error finding an image").then(() => delr(interaction, 7500));
        }
    }
};

async function sendImage(interaction, results) {
    const num = Math.floor(Math.random() * results.length);
    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder().setCustomId('next').setLabel('Next').setStyle(ButtonStyle.Primary).setEmoji('➡️'),
            new ButtonBuilder().setCustomId('delete').setLabel('Delete').setStyle(ButtonStyle.Danger).setEmoji('🗑️'),
            new ButtonBuilder().setCustomId('save').setLabel('Save').setStyle(ButtonStyle.Success).setEmoji('❤️')
        );

    const message = await er(interaction, `${results[num]?.url}`, undefined, row);

    if (!message || !message.id) return;

    const filter = i => i.customId === 'next' || i.customId === 'delete' || i.customId === 'save' && i.user.id === interaction.user.id;
    const collector = message.createMessageComponentCollector({ filter, time: 15000 });

    collector.on('collect', async i => {
        if (i.customId === 'next') {
            await i.update({ components: [] }).catch(err => err);
            collector.stop();
            sendImage(interaction, results);
        } else if (i.customId === 'delete') {
            await i.deferUpdate().catch(err => err);
            await i.deleteReply().catch(err => err);
            collector.stop();
        } else if (i.customId === 'save') {
            await i.update({ components: [] });
            collector.stop();
        }
    });

    collector.on('end', collected => {
        if (collected.size === 0) interaction.deleteReply();
    });
}