const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { r } = require("../../../utils/functions/functions.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('love')
        .setDescription('Calculates the love affinity you have for another person.')
        .addUserOption(option => option.setName('target').setDescription('The user to calculate the love affinity with')),
    execute: async (interaction) => {
        let person = interaction.options.getMember('target');

        if (!person || interaction.user.id === person.id) {
            const allMembers = [
                ...(
                    (await interaction.guild.members.fetch())
                        .filter(m => m.id !== interaction.user.id)
                ).values()
            ]
            person = allMembers[Math.floor(Math.random() * allMembers.length)];
        }

        const love = Math.random() * 100;
        const loveIndex = Math.floor(love / 10);
        const loveLevel = "💖".repeat(loveIndex) + "💔".repeat(10 - loveIndex);

        const embed = new EmbedBuilder()
            .setColor("#ffb6c1")
            .addFields({
                name: `☁ **${person.displayName}** loves **${interaction.member.displayName}** this much:`,
                value: `💟 ${Math.floor(love)}%\n\n${loveLevel}`
            }).setTimestamp();

        return r(interaction, "", embed);
    }
};