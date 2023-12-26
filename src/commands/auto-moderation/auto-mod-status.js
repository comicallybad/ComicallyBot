const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { re, delr } = require("../../../utils/functions/functions.js");
const db = require("../../../utils/schemas/db.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('auto-mod-status')
        .setDescription('Display the status of the auto-moderation system')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    execute: async (interaction) => {
        const guildID = interaction.guild.id;
        const embed = new EmbedBuilder()
            .setColor("#0efefe")
            .setTitle("Auto-Moderation Status")
            .setDescription("`True` === `active`, `false` ===  `inactive`.")
            .setTimestamp();

        const exists = await db.findOne({ guildID: guildID });
        if (!exists) return re(interaction, "There is no data for this server.").then(() => delr(interaction, 7500));

        const antiSpam = exists.antiSpam;
        const profanityFilter = exists.profanityFilter;
        embed.addFields(
            { name: "Anti-Phisihng:", value: `\`${antiSpam}\`` },
            { name: "Anti-Spam:", value: `\`${profanityFilter}\`` },
            { name: "Profanity Filter:", value: `\`${profanityFilter}\`` });
        return re(interaction, '', embed).then(() => delr(interaction, 30000));
    },
};