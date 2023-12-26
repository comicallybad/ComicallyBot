const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const chooseArr = ["🗻", "📰", "✂"];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rock-paper-scissors')
        .setDescription('Play a game of Rock Paper Scissors.'),
    execute: async (interaction) => {
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('rock').setLabel('Rock').setStyle(ButtonStyle.Secondary).setEmoji('🗻'),
            new ButtonBuilder().setCustomId('paper').setLabel('Paper').setStyle(ButtonStyle.Secondary).setEmoji('📰'),
            new ButtonBuilder().setCustomId('scissors').setLabel('Scissors').setStyle(ButtonStyle.Secondary).setEmoji('✂'));

        const embed = new EmbedBuilder()
            .setColor("#ffffff")
            .setFooter({ text: interaction.guild.members.me.displayName, iconURL: interaction.guild.members.me.displayAvatarURL() })
            .setTitle("Rock Paper Scissors!")
            .setTimestamp();

        const message = await interaction.reply({ embeds: [embed], components: [row] });

        const filter = i => i.customId === 'rock' || i.customId === 'paper' || i.customId === 'scissors' && i.user.id === interaction.user.id;
        const collector = message.createMessageComponentCollector({ filter, time: 15000 });

        collector.on('collect', async i => {
            const botChoice = chooseArr[Math.floor(Math.random() * chooseArr.length)];
            const result = getResult(i.customId, botChoice);
            embed.addFields({ name: `${result}`, value: `${i.customId} vs ${botChoice}` });
            await i.update({ embeds: [embed], components: [] });
        });
    }
};

function getResult(me, clientChosen) {
    if ((me === "rock" && clientChosen === "✂") ||
        (me === "paper" && clientChosen === "🗻") ||
        (me === "scissors" && clientChosen === "📰")) {
        return "You won!";
    } else if (me === clientChosen) {
        return "It's a tie!";
    } else {
        return "You lost!";
    }
}